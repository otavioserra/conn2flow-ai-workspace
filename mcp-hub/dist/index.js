#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = require("./server.js");
const server = new server_js_1.McpServer();
server.startStdio();
