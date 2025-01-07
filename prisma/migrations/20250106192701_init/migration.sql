-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL PRIMARY KEY,
    "keyId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PasskeyUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "publicKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transports" TEXT NOT NULL,
    "registered" BIGINT NOT NULL,
    "last_used" BIGINT,
    "counter" INTEGER NOT NULL DEFAULT 0,
    "encryptedShares" TEXT NOT NULL,
    "keyId" TEXT NOT NULL DEFAULT ''
);
