import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import * as path from 'path';
import { Prisma, User } from '@prisma/client';
import * as argon from 'argon2';
import { createSongDto } from 'src/songs/dto';
import { createPlaylistDto } from 'src/playlists/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const adminUserData = {
    password: 'asdasdasd',
    email: 'dev@mail.ru',
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('/api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    pactum.request.setBaseUrl('http://localhost:3333/api/v1');

    await prisma.cleanDb();

    await prisma.user.create({
      data: {
        email: adminUserData.email,
        hash: await argon.hash(adminUserData.password),
        username: 'admin',
        role: 'admin',
      },
    });

    await pactum
      .spec()
      .post('/auth/signin')
      .withBody({
        email: adminUserData.email,
        password: adminUserData.password,
      })
      .stores('adminAccToken', 'access_token');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'tema.illar@mail.ru',
      password: 'lalalallala',
    };

    const dto2: AuthDto = {
      email: 'tema.illar2@mail.ru',
      password: 'adsaasdasdd',
    };

    describe('Sign up', () => {
      it('Should fail if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should fail if password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should fail if body is not provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });

      it('Should sign up', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .stores('accToken2', 'access_token');
      });

      it('Should fail for same credentials', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });

      it('Should sign up with different credentials', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto2)
          .expectStatus(201)
          .expectBodyContains('access_token')
          .expectBodyContains('refresh_token');
      });
    });

    describe('Sign in', () => {
      it('Should fail if email is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('Should fail if password is not provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('Should fail if body is not provided', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('Should fail if credentials are incorrect', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto2.email,
            password: 'kfkdsjfjkjsdkfjk',
          })
          .expectStatus(403);
      });

      it('Should sign in', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto2)
          .expectBodyContains('access_token')
          .expectBodyContains('refresh_token')
          .expectStatus(200)
          .stores('rToken', 'refresh_token');
      });
    });

    describe('Refresh Token', () => {
      it('Should fail if no token provided', () => {
        return pactum.spec().post('/auth/refresh').expectStatus(401);
      });

      it('Should refresh tokens', () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders({
            Authorization: 'Bearer $S{rToken}',
          })
          .expectBodyContains('access_token')
          .expectBodyContains('refresh_token')
          .expectStatus(200)
          .stores('newRToken', 'refresh_token');
      });

      it('Should fail for the same token', () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders({
            Authorization: 'Bearer $S{refresh_token}',
          })
          .expectStatus(401);
      });

      it('Should work for new refresh token', () => {
        return pactum
          .spec()
          .post('/auth/refresh')
          .withHeaders({
            Authorization: 'Bearer $S{newRToken}',
          })
          .expectBodyContains('access_token')
          .expectBodyContains('refresh_token')
          .expectStatus(200)
          .stores('refToken', 'refresh_token')
          .stores('accToken', 'access_token');
      });
    });
  });

  describe('Users', () => {
    describe('Get users', () => {
      it('Should fail searching not existing user', () => {
        return pactum.spec().get('/users/asfj').expectStatus(404);
      });

      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/get/me')
          .withHeaders({
            Authorization: 'Bearer $S{accToken2}',
          })
          .expectStatus(200)
          .expectBodyContains('username')
          .stores('usrName', 'username');
      });

      it('Should get user', () => {
        return pactum.spec().get('/users/$S{usrName}').expectStatus(200);
      });
    });

    describe('Update users', () => {
      it('Should fail updating user without auth', () => {
        return pactum
          .spec()
          .patch('/users/update')
          .withBody({
            username: 'Antoha',
            image_key: 'lalalla',
            image_url: 'lol',
          })
          .expectStatus(401);
      });

      it('Should update user', () => {
        return pactum
          .spec()
          .patch('/users/update')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withBody({
            username: 'Antoha',
            image_key: 'lalalla',
            image_url: 'lol',
          })
          .expectStatus(200);
      });

      it('Should fail updating user to existing username', () => {
        return pactum
          .spec()
          .patch('/users/update')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withBody({
            username: '$S{usrName}',
            image_key: 'lalalla',
            image_url: 'lol',
          })
          .expectStatus(403);
      });
    });
  });

  describe('Files', () => {
    describe('Images', () => {
      it('Should fail without image', () => {
        return pactum
          .spec()
          .post('/files/image/upload')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(400);
      });

      it('Should fail without auth', () => {
        return pactum
          .spec()
          .post('/files/image/upload')
          .withFile('image', path.resolve(__dirname, './files/npesta.png'))
          .expectStatus(401);
      });

      it('Should fail for not an image file', () => {
        return pactum
          .spec()
          .post('/files/image/upload')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withFile('image', path.resolve(__dirname, './files/crush.mp3'))
          .expectStatus(400);
      });

      it('Should upload image', () => {
        return pactum
          .spec()
          .post('/files/image/upload')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withFile('image', path.resolve(__dirname, './files/npesta.png'))
          .expectStatus(201)
          .expectBodyContains('image_url')
          .expectBodyContains('image_key')
          .stores('imageKey', 'image_key');
      });

      it('Should not allow non-admin user to delete image', () => {
        return pactum
          .spec()
          .delete('/files/image/delete')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withBody({
            image_key: '$S{imageKey}',
          })
          .expectStatus(403);
      });

      it('Should delete image', () => {
        return pactum
          .spec()
          .delete('/files/image/delete')
          .withHeaders({
            Authorization: 'Bearer $S{adminAccToken}',
          })
          .withBody({
            image_key: '$S{imageKey}',
          })
          .expectStatus(200);
      });
    });

    describe('Audio', () => {
      // it('Should fail without auth', () => {
      //   return pactum
      //     .spec()
      //     .post('/files/audio/upload')
      //     .withFile('audio', path.resolve(__dirname, './files/crush.mp3'))
      //     .expectStatus(401);
      // });

      it('Should fail without audio', () => {
        return pactum
          .spec()
          .post('/files/audio/upload')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(400);
      });

      it('Should fail for not an audio file', () => {
        return pactum
          .spec()
          .post('/files/audio/upload')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withFile('audio', path.resolve(__dirname, './files/npesta.png'))
          .expectStatus(400);
      });

      it('Should upload audio', () => {
        return pactum
          .spec()
          .post('/files/audio/upload')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .withFile('audio', path.resolve(__dirname, './files/crush.mp3'))
          .expectStatus(201);
      });
    });
  });

  describe('Songs', () => {
    const createSongDto: createSongDto = {
      album: 'ex lovers',
      author: 'taylor',
      name: 'torture',
      url: 'https://asdasdasdasd',
    };

    describe('Create a Song Record', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .withBody(createSongDto)
          .post('/songs/create')
          .expectStatus(401);
      });

      it('Should fail without author', () => {
        return pactum
          .spec()
          .withBody({
            album: createSongDto.album,
            name: createSongDto.name,
            url: createSongDto.url,
          })
          .post('/songs/create')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(400);
      });

      it('Should fail without name', () => {
        return pactum
          .spec()
          .withBody({
            album: createSongDto.album,
            url: createSongDto.url,
            author: createSongDto.author,
          })
          .post('/songs/create')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(400);
      });

      it('Should fail without url', () => {
        return pactum
          .spec()
          .withBody({
            album: createSongDto.album,
            name: createSongDto.name,
            author: createSongDto.author,
          })
          .post('/songs/create')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(400);
      });

      it('Should create a song', () => {
        return pactum
          .spec()
          .withBody({
            album: createSongDto.album,
            name: createSongDto.name,
            author: createSongDto.author,
            url: createSongDto.url,
          })
          .post('/songs/create')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(201)
          .stores('songId', 'id');
      });

      it('Should create a second song', () => {
        return pactum
          .spec()
          .withBody({
            album: createSongDto.album,
            name: createSongDto.name,
            author: createSongDto.author,
            url: createSongDto.url,
          })
          .post('/songs/create')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(201)
          .stores('songId2', 'id');
      });
    });

    describe('Update a song', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .withBody(createSongDto)
          .patch('/songs/update/1')
          .expectStatus(401);
      });

      it('Should fail updating unknown song', () => {
        return pactum
          .spec()
          .withBody(createSongDto)
          .withBearerToken('$S{accToken}')
          .patch('/songs/update/4')
          .expectStatus(404);
      });

      it('Should fail updating the song by a different user', () => {
        return pactum
          .spec()
          .withBody({
            name: 'Kill You',
          })
          .withBearerToken('$S{accToken2}')
          .patch('/songs/update/$S{songId}')
          .expectStatus(403);
      });

      it('Should update a song', () => {
        return pactum
          .spec()
          .withBody({
            name: 'Kill You',
          })
          .withBearerToken('$S{accToken}')
          .patch('/songs/update/$S{songId}')
          .expectStatus(200);
      });
    });

    describe('Get songs', () => {
      it('Shoud get a song by id', () => {
        return pactum
          .spec()
          .get('/songs/$S{songId}')
          .expectStatus(200)
          .expectBodyContains('name');
      });

      it('Shoud get random song', () => {
        return pactum
          .spec()
          .get('/songs/get/random')
          .expectStatus(200)
          .expectBodyContains('name');
      });
    });

    describe('Delete a song', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .withBody(createSongDto)
          .delete('/songs/delete/1')
          .expectStatus(401);
      });

      it('Should fail deleting the song by a different user', () => {
        return pactum
          .spec()
          .withBearerToken('$S{accToken2}')
          .delete('/songs/delete/$S{songId}')
          .expectStatus(403);
      });

      it('Should delete the song', () => {
        return pactum
          .spec()
          .withBearerToken('$S{accToken}')
          .delete('/songs/delete/$S{songId}')
          .expectStatus(200);
      });
    });
  });

  describe('Playlists', () => {
    const createPlaylistDto: createPlaylistDto = {
      name: 'playlist1',
    };

    describe('Create a playlist', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .post('/playlists/create')
          .withBody(createPlaylistDto)
          .expectStatus(401);
      });

      it('Should fail without playlist name', () => {
        return pactum
          .spec()
          .post('/playlists/create')
          .withBearerToken('$S{accToken}')
          .expectStatus(400);
      });

      it('Should create a playlist', () => {
        return pactum
          .spec()
          .post('/playlists/create')
          .withBearerToken('$S{accToken}')
          .withBody(createPlaylistDto)
          .expectStatus(201)
          .stores('playlistId', 'id');
      });
    });

    describe('Get a playlist', () => {
      it('Should get a playlist by id', () => {
        return pactum
          .spec()
          .get('/playlists/$S{playlistId}')
          .expectStatus(200)
          .expectBodyContains('songs');
      });
    });

    describe('Update playlist', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .patch('/playlists/update/$S{playlistId}')
          .withBody({
            name: 'dance',
          })
          .expectStatus(401);
      });

      it('Should fail for different user', () => {
        return pactum
          .spec()
          .patch('/playlists/update/$S{playlistId}')
          .withBody({
            name: 'dance',
          })
          .withBearerToken('$S{accToken2}')
          .expectStatus(403);
      });

      it('Should update playlist name', () => {
        return pactum
          .spec()
          .patch('/playlists/update/$S{playlistId}')
          .withBody({
            name: 'dance',
          })
          .withBearerToken('$S{accToken}')
          .expectStatus(200);
      });
    });

    describe('Add song to playlist', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .patch('/playlists/$S{playlistId}/song/add/$S{songId2}')
          .expectStatus(401);
      });

      it('Should fail for different user', () => {
        return pactum
          .spec()
          .patch('/playlists/$S{playlistId}/song/add/$S{songId2}')
          .withBearerToken('$S{accToken2}')
          .expectStatus(403);
      });

      it('Should update playlist songs', () => {
        return pactum
          .spec()
          .patch('/playlists/$S{playlistId}/song/add/$S{songId2}')
          .withBearerToken('$S{accToken}')
          .expectStatus(200)
          .expectJsonLength('songs', 1);
      });

      it('Should not add the same song twice', () => {
        return pactum
          .spec()
          .patch('/playlists/$S{playlistId}/song/add/$S{songId2}')
          .withBearerToken('$S{accToken}')
          .expectStatus(400);
      });
    });

    describe('Remove a song from playlist', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .delete('/playlists/$S{playlistId}/song/remove/$S{songId2}')
          .expectStatus(401);
      });

      it('Should fail for different user', () => {
        return pactum
          .spec()
          .delete('/playlists/$S{playlistId}/song/remove/$S{songId2}')
          .withBearerToken('$S{accToken2}')
          .expectStatus(403);
      });

      it('Should update playlist songs (remove)', () => {
        return pactum
          .spec()
          .delete('/playlists/$S{playlistId}/song/remove/$S{songId2}')
          .withBearerToken('$S{accToken}')
          .expectStatus(200)
          .expectJsonLength('songs', 0);
      });
    });

    describe("Add playylist to user's collection", () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .patch('/users/playlists/add/$S{playlistId}')
          .expectStatus(401);
      });

      it("Should add playlist to user's collection", () => {
        return pactum
          .spec()
          .patch('/users/playlists/add/$S{playlistId}')
          .withBearerToken('$S{accToken2}')
          .expectStatus(200)
          .inspect()
          .expectJsonLength('added_playlists', 2);
      });

      it("Should not add the same playlist to user's collection", () => {
        return pactum
          .spec()
          .patch('/users/playlists/add/$S{playlistId}')
          .withBearerToken('$S{accToken2}')
          .expectStatus(400);
      });
    });

    describe("Remove playlist from user's collection", () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .delete('/users/playlists/remove/$S{playlistId}')
          .expectStatus(401);
      });

      it("Should remove playlist from user's collection", () => {
        return pactum
          .spec()
          .delete('/users/playlists/remove/$S{playlistId}')
          .withBearerToken('$S{accToken2}')
          .expectStatus(200)
          .inspect()
          .expectJsonLength('added_playlists', 1);
      });
    });

    describe('Delete playlist', () => {
      it('Should fail without auth', () => {
        return pactum
          .spec()
          .delete('/playlists/delete/$S{playlistId}')
          .expectStatus(401);
      });

      it('Should fail for different user', () => {
        return pactum
          .spec()
          .delete('/playlists/delete/$S{playlistId}')
          .withBearerToken('$S{accToken2}')
          .expectStatus(403);
      });

      it('Should delete playlist', () => {
        return pactum
          .spec()
          .delete('/playlists/delete/$S{playlistId}')
          .withBearerToken('$S{accToken}')
          .expectStatus(200);
      });

      it('Should fail getting deleted playlist by id', () => {
        return pactum.spec().get('/playlists/$S{playlistId}').expectStatus(404);
      });
    });

    afterAll(async () => {
      await pactum
        .spec()
        .post('/playlists/create')
        .withBody({
          name: 'playlist2',
        })
        .stores('playlistId2', 'id');

      await pactum
        .spec()
        .patch('/playlists/$S{playlistId}/song/add/$S{songId2}')
        .withBearerToken('$S{accToken}');
    });
  });

  // describe("Categories", () => {

  // })
});
