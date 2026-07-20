/**
 * Tiny built-in fake-data generator for {{fake.*}} template tokens — no
 * external dependency (avoids pulling in a full faker library for a handful
 * of common shapes). Mirrored in frontend/src/lib/fakeData.ts so Test and
 * Deploy produce the same set of supported tokens.
 */

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Priya', 'Wei', 'Sofia', 'Liam', 'Noah', 'Emma', 'Olivia', 'Arjun'];
const LAST_NAMES = ['Smith', 'Johnson', 'Patel', 'Garcia', 'Chen', 'Kim', 'Müller', 'Nguyen', 'Silva', 'Kumar', 'Brown', 'Davies', 'Rossi', 'Ivanov'];
const CITIES = ['Austin', 'Berlin', 'Toronto', 'Singapore', 'Mumbai', 'São Paulo', 'Nairobi', 'Warsaw', 'Seoul', 'Lisbon'];
const COUNTRIES = ['United States', 'Germany', 'Canada', 'India', 'Brazil', 'Kenya', 'Poland', 'South Korea', 'Portugal', 'Japan'];
const COMPANIES = ['Northwind', 'Globex', 'Initech', 'Umbrella Labs', 'Stark Industries', 'Wayne Enterprises', 'Hooli', 'Acme Corp', 'Soylent', 'Cyberdyne'];
const WORDS = ['velocity', 'pipeline', 'signal', 'cascade', 'orbit', 'vector', 'lattice', 'harbor', 'quartz', 'ember', 'summit', 'drift'];
const DOMAINS = ['example.com', 'mail.dev', 'inbox.io', 'test-domain.com'];

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/** Returns undefined for unknown kinds, so callers can fall back gracefully. */
export function generateFake(kind: string): any {
    switch (kind.toLowerCase()) {
        case 'firstname': return pick(FIRST_NAMES);
        case 'lastname': return pick(LAST_NAMES);
        case 'name': return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
        case 'email': return `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}${randomInt(1, 99)}@${pick(DOMAINS)}`;
        case 'username': return `${pick(FIRST_NAMES).toLowerCase()}${randomInt(10, 9999)}`;
        case 'uuid':
        case 'id': return uuid();
        case 'number': return randomInt(1, 1000);
        case 'price': return (randomInt(500, 50000) / 100).toFixed(2);
        case 'boolean': return Math.random() < 0.5;
        case 'date': return new Date(Date.now() - randomInt(0, 365) * 86400000).toISOString().slice(0, 10);
        case 'timestamp': return Date.now() - randomInt(0, 1000000);
        case 'city': return pick(CITIES);
        case 'country': return pick(COUNTRIES);
        case 'company': return pick(COMPANIES);
        case 'word': return pick(WORDS);
        case 'sentence': return `The ${pick(WORDS)} ${pick(WORDS)} through the ${pick(WORDS)}.`;
        case 'phone': return `+1-555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
        case 'avatar': return `https://i.pravatar.cc/150?u=${uuid()}`;
        case 'color': return `#${randomInt(0, 0xffffff).toString(16).padStart(6, '0')}`;
        case 'ip': return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
        default: return undefined;
    }
}

export const FAKE_TOKENS = [
    'name', 'firstName', 'lastName', 'email', 'username', 'uuid', 'number', 'price',
    'boolean', 'date', 'timestamp', 'city', 'country', 'company', 'word', 'sentence',
    'phone', 'avatar', 'color', 'ip',
] as const;
