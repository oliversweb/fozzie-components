import StatClient from '../index';

const Mock = require('@elastic/elasticsearch-mock');

const mock = new Mock();

const expectedPostResponse = {
    _index: 'justeat',
    _type: '_doc',
    result: 'created',
    statusCode: 201,
    meta: {
        context: null,
        request:     {
            method: 'POST',
            path: '/justeat/_doc',
            body: '{"tenant":"uk","feature":"checkoutweb_test","timeStamp":"2021-05-21T13:51:39.002Z","verb":"GET","segment":"/jazz1","status":200,"timing":654}'
        },
        name: 'elasticsearch-js',
        connection: {
            url: 'http://localhost:9200/',
            id: 'http://localhost:9200/'
        },
        attempts: 0,
        aborted: false
    }
};

describe('publisher', () => {
    beforeEach(() => {});

    it('should be defined', async () => {
        // Arrange, Act & Assert
        expect(StatClient).toBeDefined();
    });

    it('should define expected method', async () => {
        // Arrange, Act & Assert
        expect(new StatClient().publish).toBeDefined();
    });

    it('should build expected instance', async () => {
        // Arrange
        const ctorParams = {
            url: 'http://localhost',
            port: 9200,
            tenant: 'ZX',
            featureName: 'strangeTown',
            user: '',
            pwd: '',
            indexName: 'jazzT'
        };

        // Act
        const client = new StatClient(
            ctorParams.url,
            ctorParams.port,
            ctorParams.tenant,
            ctorParams.featureName,
            ctorParams.user,
            ctorParams.pwd,
            ctorParams.indexName,
            ctorParams.mock
        );

        // Assert
        expect(client.client.name).toBe('elasticsearch-js');
        expect(client.tenant).toBe(ctorParams.tenant);
        expect(client.feature).toBe(ctorParams.featureName);
        expect(client.indexName).toBe(ctorParams.indexName);
    });

    it('should build expected default instance', async () => {
        // Arrange
        const expected = {
            url: 'http://localhost',
            port: 9200,
            tenant: 'ns',
            featureName: 'NotSpecified',
            indexName: 'justeat'
        };

        // Act
        const client = new StatClient();

        // Assert
        expect(client.client.name).toBe('elasticsearch-js');
        expect(client.tenant).toBe(expected.tenant);
        expect(client.feature).toBe(expected.featureName);
        expect(client.indexName).toBe(expected.indexName);
    });

    it('should return expected reponse', async () => {
        // Arrange
        const ctorParams = {
            url: 'http://localhost',
            port: 9200,
            tenant: 'uk',
            featureName: 'checkoutweb_test',
            user: '',
            pwd: '',
            indexName: 'justeat',
            mock
        };

        // Mock ElasticSearch POST with expected response
        mock.add({
            method: 'POST',
            path: '*'
        }, () => (expectedPostResponse));

        const statValues = {
            verb: 'GET', segment: '/jazz1', status: 200, timing: 654
        };

        const bodyRegex = new RegExp(`{"tenant":"${ctorParams.tenant}",` +
                                    `"feature":"${ctorParams.featureName}",` +
                                    '"timeStamp":".{4}-.{2}-.{2}T.{2}:.{2}:.{2}..{3}Z",' +
                                    `"verb":"${statValues.verb}",` +
                                    `"segment":"${statValues.segment}",` +
                                    `"status":${statValues.status},` +
                                    `"timing":${statValues.timing}}`);

        const client = new StatClient(
            ctorParams.url,
            ctorParams.port,
            ctorParams.tenant,
            ctorParams.featureName,
            ctorParams.user,
            ctorParams.pwd,
            ctorParams.indexName,
            ctorParams.mock
        );

        // Act
        const response = await client.publish(statValues);

        // Assert
        expect(response.body.result).toBe('created');
        expect(response.body.statusCode).toBe(201);
        expect(response.body._index).toBe(ctorParams.indexName);
        expect(response.meta.request.params.body).toMatch(bodyRegex);
        expect(response.meta.connection.id).toBe('http://localhost:9200/');
        expect(response.warnings).toBe(null);
    });
});
