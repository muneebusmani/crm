// import {
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
//
// @Injectable()
// export class AuthService {
//   private readonly saltRounds: number;
//   constructor(
//     private readonly prismaService: PrismaService,
//     private readonly jwtService: JwtService,
//     private readonly configService: ConfigService,
//   ) {
//     this.saltRounds = parseInt(
//       this.configService.get<string>('SALT_ROUNDS') || '10',
//       10,
//     );
//   }
//
//   private async generateToken(user: { id: number; email: string }) {
//     const payload = { sub: user.id, email: user.email };
//     return await this.jwtService.signAsync(payload);
//   }
//
//   async login(dto: LoginDto) {
//     const user = await this.prismaService.user.findUnique({
//       where: { email: dto.email },
//     });
//
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }
//
//     const passwordMatches = await bcrypt.compare(dto.password, user.password);
//
//     if (!passwordMatches) {
//       throw new UnauthorizedException('Invalid credentials');
//     }
//
//     const access_token = await this.generateToken(user);
//
//     return {
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         username: user.username,
//       },
//       access_token,
//     };
//   }
//
//   async register(dto: RegisterDto) {
//     const { name, email, username, password } = dto;
//
//     try {
//       const hashedPassword = await bcrypt.hash(password, this.saltRounds);
//
//       const user = await this.prismaService.user.create({
//         data: {
//           name,
//           email,
//           username,
//           password: hashedPassword,
//         },
//       });
//
//       const access_token = await this.generateToken(user);
//
//       return {
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           username: user.username,
//         },
//         access_token,
//       };
//     } catch (error) {
//       if (error.code === 'P2002') {
//         throw new ConflictException(
//           'User with this email or username already exists',
//         );
//       }
//       throw new InternalServerErrorException('Registration failed');
//     }
//   }
// }
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthService", {
    enumerable: true,
    get: function() {
        return AuthService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _jwt = require("@nestjs/jwt");
const _typeorm = require("@nestjs/typeorm");
const _bcrypt = /*#__PURE__*/ _interop_require_wildcard(require("bcrypt"));
const _entities = require("../user/entities");
const _typeorm1 = require("typeorm");
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
let AuthService = class AuthService {
    async generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email
        };
        return await this.jwtService.signAsync(payload);
    }
    async login(dto) {
        const user = await this.userRepository.findOne({
            where: {
                email: dto.email
            }
        });
        if (!user) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        const passwordMatches = await _bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new _common.UnauthorizedException('Invalid credentials');
        }
        const access_token = await this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username
            },
            access_token
        };
    }
    async register(dto) {
        const { name, email, username, password } = dto;
        try {
            const hashedPassword = await _bcrypt.hash(password, this.saltRounds);
            const user = this.userRepository.create({
                name,
                email,
                username,
                password: hashedPassword
            });
            const savedUser = await this.userRepository.save(user);
            const access_token = await this.generateToken(savedUser);
            return {
                user: {
                    id: savedUser.id,
                    name: savedUser.name,
                    email: savedUser.email,
                    username: savedUser.username
                },
                access_token
            };
        } catch (error) {
            if (error.code === '23505' || error.detail?.includes('already exists')) {
                throw new _common.ConflictException('User with this email or username already exists');
            }
            throw new _common.InternalServerErrorException('Registration failed');
        }
    }
    constructor(userRepository, jwtService, configService){
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.saltRounds = parseInt(this.configService.get('SALT_ROUNDS') || '10', 10);
    }
};
AuthService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_param(0, (0, _typeorm.InjectRepository)(_entities.User)),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _typeorm1.Repository === "undefined" ? Object : _typeorm1.Repository,
        typeof _jwt.JwtService === "undefined" ? Object : _jwt.JwtService,
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], AuthService);

//# sourceMappingURL=auth.service.js.map