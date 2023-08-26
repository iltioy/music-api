import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
          .expectStatus(201);
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
      it('Should get user', () => {
        return pactum.spec().get('/users/User0').expectStatus(200).inspect();
      });

      it('Should get current user', () => {
        return pactum
          .spec()
          .get('/users/get/me')
          .withHeaders({
            Authorization: 'Bearer $S{accToken}',
          })
          .expectStatus(200)
          .expectBodyContains('username');
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
            username: 'User0',
            image_key: 'lalalla',
            image_url: 'lol',
          })
          .expectStatus(403);
      });
    });
  });

  it.todo('should pass');
});
