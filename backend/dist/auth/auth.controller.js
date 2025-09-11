"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AuthController", {
    enumerable: true,
    get: function() {
        return AuthController;
    }
});
const _common = require("@nestjs/common");
const _authservice = require("./auth.service");
const _publicdecorator = require("./decorators/public.decorator");
const _logindto = require("./dto/login.dto");
const _registerdto = require("./dto/register.dto");
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
let AuthController = class AuthController {
    async login(dto, res) {
        const { user, access_token } = await this.authService.login(dto);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/'
        });
        return {
            message: 'Login successful',
            user,
            access_token
        };
    }
    async register(dto, res) {
        const { user, access_token } = await this.authService.register(dto);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'strict',
            path: '/'
        });
        return {
            message: 'User registered successfully',
            user,
            access_token
        };
    }
    constructor(authService){
        this.authService = authService;
    }
};
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('/login'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _logindto.LoginDto === "undefined" ? Object : _logindto.LoginDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
_ts_decorate([
    (0, _publicdecorator.Public)(),
    (0, _common.Post)('/register'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Res)({
        passthrough: true
    })),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _registerdto.RegisterDto === "undefined" ? Object : _registerdto.RegisterDto,
        typeof Response === "undefined" ? Object : Response
    ]),
    _ts_metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
AuthController = _ts_decorate([
    (0, _common.Controller)('/auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _authservice.AuthService === "undefined" ? Object : _authservice.AuthService
    ])
], AuthController);

//# sourceMappingURL=auth.controller.js.map