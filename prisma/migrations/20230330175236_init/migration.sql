-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" VARCHAR(64) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Film" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(64) NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "realeseDate" DATE NOT NULL,
    "preview" VARCHAR(255),
    "manifest" VARCHAR(255) NOT NULL,
    "video" VARCHAR(255) NOT NULL,

    CONSTRAINT "Film_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preset" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "brightness" INTEGER NOT NULL DEFAULT 100,
    "contrast" INTEGER NOT NULL DEFAULT 100,
    "saturation" INTEGER NOT NULL DEFAULT 1,
    "sharpness" INTEGER NOT NULL DEFAULT 100,
    "offEpilepticScene" BOOLEAN NOT NULL DEFAULT false,
    "enableCustomGamma" BOOLEAN NOT NULL DEFAULT false,
    "red" INTEGER NOT NULL DEFAULT 255,
    "green" INTEGER NOT NULL DEFAULT 255,
    "blue" INTEGER NOT NULL DEFAULT 255,
    "isStandard" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Preset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
