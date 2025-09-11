/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminService", {
    enumerable: true,
    get: function() {
        return AdminService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _typeorm1 = require("typeorm");
const _entities = require("../entities");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let AdminService = class AdminService {
    async createAdmin(dto) {
        const hashedPassword = await _bcrypt.hash(dto.password, 10);
        // Create user first
        const user = this.userRepository.create({
            name: dto.name,
            email: dto.email,
            username: dto.username,
            password: hashedPassword
        });
        const savedUser = await this.userRepository.save(user);
        // Create admin record
        let adminRole = null;
        if (dto.adminRoleId) {
            adminRole = await this.adminRoleRepository.findOne({
                where: {
                    id: dto.adminRoleId
                }
            });
        }
        const admin = this.adminRepository.create({
            role: dto.role,
            roleId: dto.adminRoleId,
            user: savedUser,
            adminRole: adminRole || undefined
        });
        await this.adminRepository.save(admin);
        // Return user with admin relationship
        return await this.userRepository.findOne({
            where: {
                id: savedUser.id
            },
            relations: [
                'admin',
                'admin.adminRole'
            ]
        });
    }
    async getAllAdmins() {
        return await this.userRepository.find({
            where: {
                admin: {
                    id: undefined
                }
            },
            relations: [
                'admin',
                'admin.adminRole'
            ]
        });
    }
    async getAdminById(id) {
        const user = await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'admin',
                'admin.adminRole'
            ]
        });
        if (!user || !user.admin) {
            throw new _common.NotFoundException('Admin not found');
        }
        return user;
    }
    async updateAdmin(id, dto) {
        // Check if user exists and is admin
        const existingUser = await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'admin'
            ]
        });
        if (!existingUser || !existingUser.admin) {
            throw new _common.NotFoundException('Admin not found');
        }
        // Update user fields
        const updateUser = {};
        if (dto.name !== undefined) updateUser.name = dto.name;
        if (dto.email !== undefined) updateUser.email = dto.email;
        if (dto.username !== undefined) updateUser.username = dto.username;
        if (dto.password) {
            updateUser.password = await _bcrypt.hash(dto.password, 10);
        }
        if (Object.keys(updateUser).length > 0) {
            await this.userRepository.update(id, updateUser);
        }
        // Update admin fields
        const updateAdmin = {};
        if (dto.role !== undefined) updateAdmin.role = dto.role;
        if (dto.adminRoleId !== undefined) updateAdmin.roleId = dto.adminRoleId;
        if (Object.keys(updateAdmin).length > 0) {
            await this.adminRepository.update(existingUser.admin.id, updateAdmin);
        }
        // Return updated user with admin relationship
        return await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'admin',
                'admin.adminRole'
            ]
        });
    }
    async deleteAdmin(id) {
        const user = await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'admin'
            ]
        });
        if (!user || !user.admin) {
            throw new _common.NotFoundException('Admin not found');
        }
        // Delete admin record first (due to foreign key constraint)
        await this.adminRepository.delete(user.admin.id);
        // Then delete user
        return await this.userRepository.delete(id);
    }
    constructor(userRepository, adminRepository, adminRoleRepository){
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.adminRoleRepository = adminRoleRepository;
    }
};
AdminService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_entities.User)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_entities.Admin)),
    _ts_param(2, (0, _typeorm.InjectRepository)(_entities.AdminRole)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], AdminService);

//# sourceMappingURL=admin.service.js.map