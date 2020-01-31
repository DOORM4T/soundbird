require('dotenv').config()
import supertest, { SuperTest, Response } from 'supertest'
import app from '../src/app'
import injectMongo, { client } from '../src/db'
import soundSchema, { Sound } from '../src/models/schemas/soundSchema'
import path from 'path'

const request: SuperTest<any> = supertest(app)

beforeAll(async () => {
	await injectMongo()
})

afterAll(async () => {
	await client.close()
})

describe('Sounds API', () => {
	const mockSound: Sound = soundSchema.validateSync(
		{ author: 'Dandelion' },
		{ stripUnknown: true }
	)
	const mockId: string = mockSound._id.toHexString()
	const mockSourceId: string = mockSound.sourceId.toHexString()

	describe('POST requests on /api/sounds', () => {
		it('successfully POSTs valid form data', async (done) => {
			request
				.post('/api/sounds/add')
				.set('Content-Type', 'multipart/form-data')
				.field('author', mockSound.author)
				.field('_id', mockId)
				.field('sourceId', mockSourceId)
				.attach('uploadedSound', path.resolve('__tests__', 'testAudio1.mp3'))
				.expect(200, done)
		})

		it('rejects form data missing uploadedSound', (done) => {
			request
				.post('/api/sounds/add')
				.set('Content-Type', 'multipart/form-data')
				.field('author', 'Dandelion')
				.expect(400, done)
		})

		it('rejects form data missing required text fields', (done) => {
			request
				.post('/api/sounds/add')
				.set('Content-Type', 'multipart/form-data')
				.attach('uploadedSound', path.resolve('__tests__', 'testAudio1.mp3'))
				.expect(400, done)
		})
	})

	describe('PUT requests on /api/sounds', () => {
		it('successfully updates JSON fields', (done) => {
			request
				.put(`/api/sounds/${mockId}`)
				.send({
					author: 'new author',
					name: 'updated name',
					fame: 2,
					badField: 'should get removed automatically',
				})
				.expect(200, done)
		})

		it('error if requested ID is invalid', (done) => {
			request
				.put(`/api/sounds/badelot`)
				.send({ author: 'knight of the bad ID' })
				.expect(400, done)
		})

		it('successfully updates uploaded sound by SourceID', (done) => {
			request
				.put(`/api/sounds/uploads/${mockSourceId}`)
				.set('Content-Type', 'multipart/form-data')
				.attach('uploadedSound', path.resolve('__tests__', 'testAudio2.mp3'))
				.expect(200, done)
		})

		it('error if requested SourceID is invalid', (done) => {
			request
				.put(`/api/sounds/uploads/potatoes`)
				.set('Content-Type', 'multipart/form-data')
				.attach('uploadedSound', path.resolve('__tests__', 'testAudio2.mp3'))
				.expect(400, done)
		})
	})

	describe('GET requests on /api/sounds', () => {
		it('gets all sound JSON', (done) => {
			request
				.get('/api/sounds')
				.expect(200)
				.end((err: Error, res: Response) => {
					if (err) throw err
					expect(res.body.length).toBeGreaterThan(0)
					done()
				})
		})

		it('gets sound data by ID', (done) => {
			request
				.get(`/api/sounds/${mockId}`)
				.expect(200)
				.end((err: Error, res: Response) => {
					if (err) throw err
					expect(soundSchema.isValidSync(res.body)).toBeTruthy()
					done()
				})
		})

		it('error if requested ID is invalid', (done) => {
			request.get(`/api/sounds/abc123thisisabadid`).expect(400, done)
		})

		it('gets audio stream by SourceID', (done) => {
			request
				.get(`/api/sounds/uploads/${mockSourceId}`)
				.expect('Content-Type', 'audio/mpeg')
				.expect('Accept-Ranges', 'bytes')
				.expect(200, done)
		})

		it('error if requested SourceID is invalid', (done) => {
			request.get(`/api/sounds/uploads/badsourceid`).expect(400, done)
		})
	})

	describe('DELETE requests on /api/sounds', () => {
		it('successfully deletes by ID', (done) => {
			request.delete(`/api/sounds/${mockId}`).expect(200, done)
		})

		it('error if requested ID is invalid', (done) => {
			request.delete('/api/sounds/hocuspocusthisisabadid-us').expect(400, done)
		})
	})
})
