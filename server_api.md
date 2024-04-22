### 授权服务器接口

*以下是面向授权服务器的接口。*

#### 1、登陆

> /oauth2/login

用户首先需要在your-approval上完成认证之后，才可以对第三方（即客户端）进行授权；

请求方法：POST

请求参数：

| 名称 | 必填 | 说明 |
| ---- | ---- | ---- |
| username | &nbsp;&nbsp;是&nbsp;&nbsp; | 用户名 |
| password | &nbsp;&nbsp;是&nbsp;&nbsp; | 密码 |
| query | &nbsp;&nbsp;是&nbsp;&nbsp; | 客户端携带的url参数；由服务器填充 |

响应数据：

```text
301 /oauth2/authorize?query
```

#### 2、注册

> /oauth2/register

请求方法：POST

请求头：

| 名称 | 必填 | 说明 |
| ---- | ---- | ---- |
| Content-type | &nbsp;&nbsp;是&nbsp;&nbsp; | 内容类型；application/json |

请求参数：

| 名称 | 必填 | 说明 |
| ---- | ---- | ---- |
| username | &nbsp;&nbsp;是&nbsp;&nbsp; | 用户名 |
| password | &nbsp;&nbsp;是&nbsp;&nbsp; | 密码 |
| password2 | &nbsp;&nbsp;是&nbsp;&nbsp; | 确认密码 |
| email | &nbsp;&nbsp;是&nbsp;&nbsp; | 邮箱 |
| code | &nbsp;&nbsp;是&nbsp;&nbsp; | 邮箱验证码 |

响应数据：

```json
{
    "error": "",
    "message": ""
}
```

#### 3、注销

> /oauth2/logout

请求方法：GET

响应数据：

```text
301 /oauth2?from=logout
```

#### 4、授权

> /oauth2/approve

请求方法：POST

请求参数：

| 名称 | 必填 | 说明 |
| ---- | ---- | ---- |
| action | &nbsp;&nbsp;是&nbsp;&nbsp; | 提交动作；1同意,2拒绝 |
| uuid | &nbsp;&nbsp;是&nbsp;&nbsp; | 请求标识 |
| scope_* | &nbsp;&nbsp;是&nbsp;&nbsp; | 权限范围；*表示权限范围具有多个 |

响应数据：

```text
# 重定向至客户端指定的地址
301 redirect_uri?code=abc&state=ef
```

#### 5、发送验证码

> /assist/captcha/sendCode

请求方法：POST

请求头：

| 名称 | 必填 | 说明 |
| ---- | ---- | ---- |
| Content-type | &nbsp;&nbsp;是&nbsp;&nbsp; | 内容类型；application/json |

请求参数：

| 名称 | 必填 | 说明 |
| ---- | ---- | ---- |
| email | &nbsp;&nbsp;是&nbsp;&nbsp; | 邮箱 |

响应数据：

```json
{
    "error": "",
    "message": ""
}
```