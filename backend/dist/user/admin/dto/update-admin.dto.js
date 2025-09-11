// import {
//   IsEmail,
//   IsOptional,
//   IsString,
//   MaxLength,
//   MinLength,
// } from 'class-validator'
//
// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name?: string
//
//   @IsOptional()
//   @IsEmail()
//   email?: string
//
//   @IsOptional()
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username?: string
//
//   @IsOptional()
//   @IsString()
//   @MinLength(6)
//   password?: string
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
// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(2)
//   @MaxLength(50)
//   name?: string;
//
//   @IsOptional()
//   @IsEmail()
//   email?: string;
//
//   @IsOptional()
//   @IsString()
//   @MinLength(3)
//   @MaxLength(30)
//   username?: string;
//
//   @IsOptional()
//   @IsString()
//   @MinLength(6)
//   password?: string;
//
//   @IsOptional()
//   @IsEnum(main_role)
//   role?: main_role;
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
Object.defineProperty(exports, "UpdateAdminDto", {
    enumerable: true,
    get: function() {
        return UpdateAdminDto;
    }
});
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
let UpdateAdminDto = class UpdateAdminDto {
};
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(2),
    (0, _classvalidator.MaxLength)(50),
    _ts_metadata("design:type", String)
], UpdateAdminDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], UpdateAdminDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(3),
    (0, _classvalidator.MaxLength)(30),
    _ts_metadata("design:type", String)
], UpdateAdminDto.prototype, "username", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(6),
    _ts_metadata("design:type", String)
], UpdateAdminDto.prototype, "password", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateAdminDto.prototype, "role", void 0);
_ts_decorate([
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], UpdateAdminDto.prototype, "adminRoleId", void 0);

//# sourceMappingURL=update-admin.dto.js.map