"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = require("@prisma/sdk");
const dmmf_1 = require("./dmmf");
describe('dmmf', () => {
    describe('parseAnnotation', () => {
        test('no annotation at all', () => {
            const received = (0, dmmf_1.parseAnnotation)();
            const expected = null;
            expect(received).toEqual(expected);
        });
        test('no @encrypted keyword', () => {
            const received = (0, dmmf_1.parseAnnotation)('not encrypted');
            const expected = null;
            expect(received).toEqual(expected);
        });
        test('@encrypted keyword alone', () => {
            const received = (0, dmmf_1.parseAnnotation)(' pre @encrypted post ');
            expect(received.encrypt).toEqual(true);
            expect(received.strictDecryption).toEqual(false);
        });
        test('@encrypted?with=junk', () => {
            const received = (0, dmmf_1.parseAnnotation)(' pre @encrypted?with=junk post ');
            expect(received.encrypt).toEqual(true);
            expect(received.strictDecryption).toEqual(false);
        });
        test('@encrypted?strict', () => {
            const received = (0, dmmf_1.parseAnnotation)(' pre @encrypted?strict post ');
            expect(received.encrypt).toEqual(true);
            expect(received.strictDecryption).toEqual(true);
        });
        test('@encrypted?readonly', () => {
            const received = (0, dmmf_1.parseAnnotation)(' pre @encrypted?readonly post ');
            expect(received.encrypt).toEqual(false);
            expect(received.strictDecryption).toEqual(false);
        });
        test('readonly takes precedence over strict', () => {
            const received = (0, dmmf_1.parseAnnotation)(' pre @encrypted?strict&readonly post ');
            expect(received.encrypt).toEqual(false);
            expect(received.strictDecryption).toEqual(false);
        });
    });
    test('analyseDMMF', async () => {
        const dmmf = await (0, sdk_1.getDMMF)({
            datamodel: `
        model User {
          id           Int     @id @default(autoincrement())
          email        String  @unique
          name         String? /// @encrypted
          posts        Post[]
          pinnedPost   Post?   @relation(fields: [pinnedPostId], references: [id], name: "pinnedPost")
          pinnedPostId Int?
        }

        model Post {
          id         Int        @id @default(autoincrement())
          title      String
          content    String?    /// @encrypted
          author     User?      @relation(fields: [authorId], references: [id], onDelete: Cascade, onUpdate: Cascade)
          authorId   Int?
          cursor     Int        @unique /// @encryption:cursor
          categories Category[]
          havePinned User[]     @relation("pinnedPost")
        }

        // Model without encrypted fields
        model Category {
          id    Int    @id @default(autoincrement())
          name  String
          posts Post[]
        }

        // Cursor fallback on unique fields
        model Unique {
          id     Json   @id // invalid type for iteration
          unique String @unique
        }
      `
        });
        const received = (0, dmmf_1.analyseDMMF)(dmmf);
        const expected = {
            User: {
                fields: {
                    name: { encrypt: true, strictDecryption: false }
                },
                connections: {
                    posts: { modelName: 'Post', isList: true },
                    pinnedPost: { modelName: 'Post', isList: false }
                },
                cursor: 'id'
            },
            Post: {
                fields: {
                    content: { encrypt: true, strictDecryption: false }
                },
                connections: {
                    author: { modelName: 'User', isList: false },
                    categories: { modelName: 'Category', isList: true },
                    havePinned: { modelName: 'User', isList: true }
                },
                cursor: 'cursor'
            },
            Category: {
                fields: {},
                connections: {
                    posts: { modelName: 'Post', isList: true }
                },
                cursor: 'id'
            },
            Unique: {
                fields: {},
                connections: {},
                cursor: 'unique'
            }
        };
        expect(received).toEqual(expected);
    });
});
