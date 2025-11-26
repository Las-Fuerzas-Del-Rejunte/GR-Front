import "@testing-library/jest-dom";

require("@testing-library/jest-dom");

const { TextEncoder, TextDecoder } = require("util");

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;