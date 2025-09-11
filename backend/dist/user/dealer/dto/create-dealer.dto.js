"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "CreateDealerDto", {
    enumerable: true,
    get: function() {
        return CreateDealerDto;
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
let CreateDealerDto = class CreateDealerDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(2),
    (0, _classvalidator.MaxLength)(50),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "name", void 0);
_ts_decorate([
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(3),
    (0, _classvalidator.MaxLength)(30),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "username", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(6),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "password", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "owner", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "location", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "logo", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "website", void 0);
_ts_decorate([
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateDealerDto.prototype, "contactEmail", void 0);
_ts_decorate([
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], CreateDealerDto.prototype, "tierId", void 0);

//# sourceMappingURL=create-dealer.dto.js.map