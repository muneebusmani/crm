// import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
//
// export class CreateUserDto {
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name: string
//
//   @IsEmail()
//   email: string
//
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username: string
//
//   @IsString()
//   @MinLength(6)
//   password: string
// }
// import {
//   IsEmail,
//   IsEnum,
//   IsNumber,
//   IsOptional,
//   IsString,
//   MaxLength,
//   MinLength,
// } from 'class-validator';
// import { main_role } from 'prisma/generated/prisma';
//
// export class CreateUserDto {
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name: string;
//
//   @IsEmail()
//   email: string;
//
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username: string;
//
//   @IsString()
//   @MinLength(6)
//   password: string;
//
//   @IsEnum(main_role)
//   role: main_role;
//
//   @IsOptional()
//   @IsNumber()
//   dealerTierId?: number;
//
//   @IsOptional()
//   @IsNumber()
//   adminRoleId?: number;
// }
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateAdminDto", {
    enumerable: true,
    get: function() {
        return CreateAdminDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateAdminDto = class CreateAdminDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(2),
    (0, _classvalidator.MaxLength)(50),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAdminDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsEmail)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAdminDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(3),
    (0, _classvalidator.MaxLength)(30),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAdminDto.prototype, "username", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(6),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAdminDto.prototype, "password", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], CreateAdminDto.prototype, "role", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], CreateAdminDto.prototype, "adminRoleId", void 0);

//# sourceMappingURL=create-admin.dto.js.map