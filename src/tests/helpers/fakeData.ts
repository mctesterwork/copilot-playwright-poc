import { faker } from '@faker-js/faker';

// If you need to add any custom fake data generators, you can do so here.

export const testLocation = {
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
}