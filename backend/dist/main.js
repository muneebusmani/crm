"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _core = require("@nestjs/core");
const _cookieparser = /*#__PURE__*/ _interop_require_default(require("cookie-parser"));
const _appmodule = require("./app.module");
const _jwtguard = require("./auth/guards/jwt.guard");
const _swagger = require("@nestjs/swagger");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
async function bootstrap() {
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    const port = process.env.PORT ?? 3001;
    const host = process.env.HOST ?? '0.0.0.0';
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new _common.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
    }));
    app.useGlobalGuards(new _jwtguard.JwtAuthGuard(app.get(_config.ConfigService)));
    app.use((0, _cookieparser.default)());
    app.enableCors({
        origin: frontendUrl,
        credentials: true
    });
    //Swagger documentation
    const config = new _swagger.DocumentBuilder().setTitle("CRM API").setDescription('API documentation for my NestJS app').setVersion('1.0').addBearerAuth() // Optional: for JWT authentication
    .build();
    const document = _swagger.SwaggerModule.createDocument(app, config);
    _swagger.SwaggerModule.setup('api', app, document); // '/api' is the route for swagger UI
    await app.listen(port, host);
    console.log(`Listening on ${host}:${port}`);
}
bootstrap();

//# sourceMappingURL=main.js.map