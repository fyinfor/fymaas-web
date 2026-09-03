/**
 * Client-side CIDR checks, for immediate feedback while typing.
 *
 * The server validates independently and is the authority; this exists so
 * a typo is caught before a round-trip. IPv4 is checked fully, including
 * the host-bits case (``10.0.0.1/8``) — that is the mistake people
 * actually make, and it is the one that silently changes which addresses
 * a rule covers. IPv6 gets a shape check only: implementing prefix
 * arithmetic over compressed notation here would duplicate real logic
 * the server already has, and getting it subtly wrong would reject valid
 * input.
 */

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

const parseIpv4 = (value: string): number[] | null => {
  const matched = value.match(IPV4_PATTERN);
  if (!matched) {
    return null;
  }
  const octets = matched.slice(1).map((part) => Number(part));
  // Reject leading zeros and out-of-range octets: "010.0.0.1" is
  // ambiguous enough that some parsers read it as octal.
  if (
    octets.some((octet, index) => {
      const raw = matched[index + 1];
      return octet > 255 || (raw.length > 1 && raw.startsWith('0'));
    })
  ) {
    return null;
  }
  return octets;
};

const hasHostBitsSet = (octets: number[], prefix: number): boolean => {
  const address =
    ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>>
    0;
  if (prefix === 0) {
    return address !== 0;
  }
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  return (address & mask) >>> 0 !== address;
};

export type CidrError = 'format' | 'hostBits' | null;

export const validateCidr = (value?: string | null): CidrError => {
  const text = (value || '').trim();
  if (!text) {
    return 'format';
  }

  const [address, prefixPart, ...rest] = text.split('/');
  if (rest.length > 0) {
    return 'format';
  }

  const octets = parseIpv4(address);
  if (octets) {
    if (prefixPart === undefined) {
      // A bare address is a valid way to name a single host; the server
      // stores it as /32.
      return null;
    }
    if (!/^\d{1,2}$/.test(prefixPart)) {
      return 'format';
    }
    const prefix = Number(prefixPart);
    if (prefix > 32) {
      return 'format';
    }
    return hasHostBitsSet(octets, prefix) ? 'hostBits' : null;
  }

  if (IPV6_PATTERN.test(address) && address.includes(':')) {
    if (prefixPart === undefined) {
      return null;
    }
    if (!/^\d{1,3}$/.test(prefixPart) || Number(prefixPart) > 128) {
      return 'format';
    }
    return null;
  }

  return 'format';
};
