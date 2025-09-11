/** biome-ignore-all lint/suspicious/noExplicitAny: <idk> */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "DealerService", {
    enumerable: true,
    get: function() {
        return DealerService;
    }
});
const _common = require("@nestjs/common");
const _typeorm = require("@nestjs/typeorm");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _typeorm1 = require("typeorm");
const _dealerentity = require("../entities/dealer.entity");
const _dealertierentity = require("../entities/dealer-tier.entity");
const _userentity = require("../entities/user.entity");
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
let DealerService = class DealerService {
    async createDealer(dto) {
        const hashedPassword = await _bcrypt.hash(dto.password, 10);
        // Create user first
        const user = this.userRepository.create({
            name: dto.name,
            email: dto.email,
            username: dto.username,
            password: hashedPassword
        });
        const savedUser = await this.userRepository.save(user);
        // Create dealer record
        let dealerTier = null;
        if (dto.tierId) {
            dealerTier = await this.dealerTierRepository.findOne({
                where: {
                    id: dto.tierId
                }
            });
        }
        const dealer = this.dealerRepository.create({
            name: dto.name,
            owner: dto.owner,
            location: dto.location,
            logo: dto.logo,
            website: dto.website,
            contactEmail: dto.contactEmail,
            tierId: dto.tierId,
            user: savedUser,
            tier: dealerTier || undefined
        });
        await this.dealerRepository.save(dealer);
        // Return user with dealer relationship
        return await this.userRepository.findOne({
            where: {
                id: savedUser.id
            },
            relations: [
                'dealer',
                'dealer.tier'
            ]
        });
    }
    async getAllDealers() {
        return await this.userRepository.find({
            where: {
                dealer: {
                    id: undefined
                }
            },
            relations: [
                'dealer',
                'dealer.tier'
            ]
        });
    }
    async getDealerById(id) {
        const user = await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'dealer',
                'dealer.tier'
            ]
        });
        if (!user || !user.dealer) {
            throw new _common.NotFoundException('Dealer not found');
        }
        return user;
    }
    async updateDealer(id, dto) {
        // Check if user exists and is dealer
        const existingUser = await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'dealer'
            ]
        });
        if (!existingUser || !existingUser.dealer) {
            throw new _common.NotFoundException('Dealer not found');
        }
        // Update user fields
        const updateUser = {};
        if (dto.name !== undefined) updateUser.name = dto.name;
        if (dto.email !== undefined) updateUser.email = dto.email;
        if (dto.username !== undefined) updateUser.username = dto.username;
        if (dto.password && dto.password.trim() !== '') {
            updateUser.password = await _bcrypt.hash(dto.password, 10);
        }
        if (Object.keys(updateUser).length > 0) {
            await this.userRepository.update(id, updateUser);
        }
        // Update dealer fields
        const updateDealer = {};
        if (dto.name !== undefined) updateDealer.name = dto.name;
        if (dto.owner !== undefined) updateDealer.owner = dto.owner;
        if (dto.location !== undefined) updateDealer.location = dto.location;
        if (dto.logo !== undefined) updateDealer.logo = dto.logo;
        if (dto.website !== undefined) updateDealer.website = dto.website;
        if (dto.contactEmail !== undefined) updateDealer.contactEmail = dto.contactEmail;
        if (dto.tierId !== undefined) updateDealer.tierId = dto.tierId;
        if (Object.keys(updateDealer).length > 0) {
            await this.dealerRepository.update(existingUser.dealer.id, updateDealer);
        }
        // Return updated user with dealer relationship
        return await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'dealer',
                'dealer.tier'
            ]
        });
    }
    async deleteDealer(id) {
        const user = await this.userRepository.findOne({
            where: {
                id
            },
            relations: [
                'dealer'
            ]
        });
        if (!user || !user.dealer) {
            throw new _common.NotFoundException('Dealer not found');
        }
        // Delete dealer record first (due to foreign key constraint)
        await this.dealerRepository.delete(user.dealer.id);
        // Then delete user
        return await this.userRepository.delete(id);
    }
    constructor(userRepository, dealerRepository, dealerTierRepository){
        this.userRepository = userRepository;
        this.dealerRepository = dealerRepository;
        this.dealerTierRepository = dealerTierRepository;
    }
};
DealerService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_userentity.User)),
    _ts_param(1, (0, _typeorm.InjectRepository)(_dealerentity.Dealer)),
    _ts_param(2, (0, _typeorm.InjectRepository)(_dealertierentity.DealerTier)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository
    ])
], DealerService);

//# sourceMappingURL=dealer.service.js.map