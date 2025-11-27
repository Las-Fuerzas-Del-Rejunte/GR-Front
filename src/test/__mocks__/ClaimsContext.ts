import { jest } from '@jest/globals';

export const addClaimMock = jest.fn();

export const useClaims = () => ({
  addClaim: addClaimMock,
  claims: [],
  updateClaimStatus: jest.fn(),
  addClaimNote: jest.fn(),
  deleteClaim: jest.fn(),
  assignClaim: jest.fn(),
  updateClaimPriority: jest.fn(),
  getClaimById: jest.fn(),
  searchClaims: jest.fn(),
});