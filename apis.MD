## APP Integration URL

`{{url}} = https://watchmen-api.novoai.de/`

for all requests

### always header
`"x-access-token": {{token}} `
that was received at login

## Login Page

`POST {{url}}/api/login`

```
{
    "name":"user 1",
    "password":"12345"
}
```
```
{
    "refresh_token": "############# refresh_token #############",
    "status": 1,
    "token": "############# token #############",
    "user": {
        "company_id": 1,
        "id": 1,
        "mail": "contact@indaaq.com",
        "public_id": "7a72e648-a98d-4d48-b7ae-1cc39bb71fa9",
        "super_user": true,
        "user_name": "user 1",
        "user_role": true
    }
}
```

## Register Page

`POST {{url}}/api/register`

```
{
    "name": "user 11y",
    "password":"12345",
    "license":"license1", ## main thing to check
    "email":"manan@gmail.com"
}
```
```
{
    "message": "New user created",
    "status": 1
}
```

## Logout Button!

`POST {{url}}/api/logout`
```
## no body
```
```
{
    "message": "successfully logout.",
    "status": 1
}
```