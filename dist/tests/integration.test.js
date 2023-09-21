"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloak_1 = require("@47ng/cloak");
const prismaClient_1 = require("./prismaClient");
const sqlite = __importStar(require("./sqlite"));
describe('integration', () => {
    const email = '007@hmss.gov.uk';
    test('create user', async () => {
        const received = await prismaClient_1.client.user.create({
            data: {
                email,
                name: 'James Bond'
            }
        });
        const dbValue = await sqlite.get({ table: 'User', where: { email } });
        expect(received.name).toEqual('James Bond'); // clear text in returned value
        expect(dbValue.name).toMatch(cloak_1.cloakedStringRegex); // encrypted in database
    });
    test('delete user', async () => {
        const received = await prismaClient_1.client.user.delete({ where: { email } });
        expect(received.name).toEqual('James Bond');
    });
    test('create post & associated user', async () => {
        var _a;
        const received = await prismaClient_1.client.post.create({
            data: {
                title: "I'm back",
                content: 'You only live twice.',
                author: {
                    create: {
                        email,
                        name: 'James Bond'
                    }
                }
            },
            select: {
                id: true,
                author: true,
                content: true
            }
        });
        const user = await sqlite.get({ table: 'User', where: { email } });
        const post = await sqlite.get({
            table: 'Post',
            where: { id: received.id.toString() }
        });
        expect((_a = received.author) === null || _a === void 0 ? void 0 : _a.name).toEqual('James Bond');
        expect(received.content).toEqual('You only live twice.');
        expect(user.name).toMatch(cloak_1.cloakedStringRegex);
        expect(post.content).toMatch(cloak_1.cloakedStringRegex);
        expect(post.title).toEqual("I'm back"); // clear text in the database
    });
    test('update user (with set)', async () => {
        const received = await prismaClient_1.client.user.update({
            data: {
                name: {
                    set: 'Bond, James Bond.'
                }
            },
            where: {
                email
            }
        });
        const user = await sqlite.get({ table: 'User', where: { email } });
        expect(received.name).toEqual('Bond, James Bond.');
        expect(user.name).toMatch(cloak_1.cloakedStringRegex);
    });
    test('complex query nesting', async () => {
        const received = await prismaClient_1.client.user.create({
            data: {
                email: '006@hmss.gov.uk',
                name: 'Alec Trevelyan',
                posts: {
                    create: [
                        {
                            title: '006 - First report',
                            content: 'For England, James?'
                        },
                        {
                            title: 'Janus Quotes',
                            content: "I've set the timers for six minutes",
                            categories: {
                                create: {
                                    name: 'Quotes'
                                }
                            }
                        }
                    ]
                }
            },
            include: {
                posts: {
                    include: {
                        categories: true
                    }
                }
            }
        });
        expect(received.name).toEqual('Alec Trevelyan');
        expect(received.posts[0].content).toEqual('For England, James?');
        expect(received.posts[1].content).toEqual("I've set the timers for six minutes");
        const user = await sqlite.get({
            table: 'User',
            where: { email: '006@hmss.gov.uk' }
        });
        const post1 = await sqlite.get({
            table: 'Post',
            where: { id: received.posts[0].id.toString() }
        });
        const post2 = await sqlite.get({
            table: 'Post',
            where: { id: received.posts[1].id.toString() }
        });
        const category = await sqlite.get({
            table: 'Category',
            where: { name: 'Quotes' }
        });
        expect(user.name).toMatch(cloak_1.cloakedStringRegex);
        expect(post1.content).toMatch(cloak_1.cloakedStringRegex);
        expect(post2.content).toMatch(cloak_1.cloakedStringRegex);
        expect(category.name).toEqual('Quotes');
    });
    test('immutable params', async () => {
        const email = 'xenia@cccp.ru';
        const params = {
            data: {
                name: 'Xenia Onatop',
                email
            }
        };
        const received = await prismaClient_1.client.user.create(params);
        const user = await sqlite.get({ table: 'User', where: { email } });
        expect(params.data.name).toEqual('Xenia Onatop');
        expect(received.name).toEqual('Xenia Onatop');
        expect(user.name).toMatch(cloak_1.cloakedStringRegex);
    });
});
