import { LoginPlatform, Status } from "../../../constants/Project";
import { FastifySchema, Response, ResponseError } from "../../../types/Server";
import { AbstractController, ControllerClassParams } from "../../../abstract/controller";
import { Controller } from "../../../decorator/Controller";
import { ServiceUser } from "../../service/user/User";
import { ServiceUserGithub } from "../../service/user/UserGithub";
import { ServiceUserWeChat } from "../../service/user/UserWeChat";
import { ServiceUserApple } from "../../service/user/UserApple";
import { ServiceUserAgora } from "../../service/user/UserAgora";

@Controller<null, ResponseType>({
    method: "post",
    path: "login",
    auth: true,
})
export class Login extends AbstractController<RequestType, ResponseType> {
    public static readonly schema: FastifySchema<null> = null;

    public readonly svc: {
        user: ServiceUser;
        userGithub: ServiceUserGithub;
        userWeChat: ServiceUserWeChat;
        userApple: ServiceUserApple;
        userAgora: ServiceUserAgora;
    };

    public constructor(params: ControllerClassParams) {
        super(params);

        this.svc = {
            user: new ServiceUser(this.userUUID),
            userGithub: new ServiceUserGithub(this.userUUID),
            userWeChat: new ServiceUserWeChat(this.userUUID),
            userApple: new ServiceUserApple(this.userUUID),
            userAgora: new ServiceUserAgora(this.userUUID),
        };
    }

    public async execute(): Promise<Response<ResponseType>> {
        const { userName, avatarURL } = await this.svc.user.assertGetNameAndAvatar();

        switch (this.loginSource) {
            case LoginPlatform.WeChat: {
                await this.svc.userWeChat.assertExist();
                break;
            }
            case LoginPlatform.Github: {
                await this.svc.userGithub.assertExist();
                break;
            }
            case LoginPlatform.Apple: {
                await this.svc.userApple.assertExist();
                break;
            }
            case LoginPlatform.Agora: {
                await this.svc.userAgora.assertExist();
            }
        }

        return {
            status: Status.Success,
            data: {
                name: userName,
                avatar: avatarURL,
                userUUID: this.userUUID,
            },
        };
    }

    public errorHandler(error: Error): ResponseError {
        return this.autoHandlerError(error);
    }
}

interface RequestType {}

interface ResponseType {
    name: string;
    avatar: string;
    userUUID: string;
}
