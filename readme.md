# Express Server with IPMI Control
This repository contains a TypeScript implementation of an Express.js server that provides endpoints for server status and updates using IPMI (Intelligent Platform Management Interface).

## Prerequisites
To run this server, you need to have the following prerequisites installed:

```
Node.js
npm (Node Package Manager)
```

## Endpoints
The server provides the following endpoints:

### GET /status/power

Returns the power status of the server. It requires the following parameters in the request body:

hostname: IP address or hostname of the server
username: IPMI username
password: IPMI password
Example response:

```
{
  "online": true
}
```

### GET /status/chassis

Returns the chassis status of the server. It requires the same parameters as the power endpoint.

Example response:

```
{
  "chassisStatus": "OK"
}
```

### POST /update/power

Sets the power state of the server. It requires the following parameters in the request body:

hostname: IP address or hostname of the server
username: IPMI username
password: IPMI password
state: Power state option ("start" or "stop")
Example request:

```
{
  "hostname": "192.168.0.1",
  "username": "admin",
  "password": "password",
  "state": "start"
}
```

### POST /update/fanspeed

Sets the fan speed of the server. It requires the following parameters in the request body:

hostname: IP address or hostname of the server
username: IPMI username
password: IPMI password
value: Fan speed value (integer)
Example request:
```
{
  "hostname": "192.168.0.1",
  "username": "admin",
  "password": "password",
  "value": "50"
}
```