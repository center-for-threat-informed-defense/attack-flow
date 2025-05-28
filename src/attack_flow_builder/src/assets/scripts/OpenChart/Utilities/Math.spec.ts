import { describe, it, expect } from "vitest";
import {
    ceilNearestMultiple, clamp, doVectorsIntersect,
    floatEq, floorNearestMultiple, generateBitMask, getLineHitbox,
    isInsideRegion, isInsideShape, roundNearestMultiple
} from "./Math";

describe("Math", () => {
    describe("clamp()", () => {
        it("clamps below minimum", () => {
            expect(clamp(-100, -20, 20)).toBe(-20);
        });
        it("clamps above maximum", () => {
            expect(clamp(100, -20, 20)).toBe(20);
        });
        it("retains value between minimum and maximum", () => {
            expect(clamp(10, -20, 20)).toBe(10);
        });
    });
    describe("roundNearestMultiple()", () => {
        it("rounds down to the nearest multiple of 5", () => {
            expect(roundNearestMultiple(12, 5)).toBe(10);
        });
        it("rounds down to the nearest multiple of 7", () => {
            expect(roundNearestMultiple(10, 7)).toBe(7);
        });
        it("rounds up to the nearest multiple of 5", () => {
            expect(roundNearestMultiple(13, 5)).toBe(15);
        });
        it("rounds up to the nearest multiple of 7", () => {
            expect(roundNearestMultiple(12, 7)).toBe(14);
        });
        it("retains the nearest multiple of 5", () => {
            expect(roundNearestMultiple(15, 5)).toBe(15);
        });
        it("retains the nearest multiple of 7", () => {
            expect(roundNearestMultiple(14, 7)).toBe(14);
        });
    });
    describe("ceilNearestMultiple()", () => {
        it("rounds 2 up to the nearest multiple of 10", () => {
            expect(ceilNearestMultiple(2, 10)).toBe(10);
        });
        it("rounds 18 up to the nearest multiple of 10", () => {
            expect(ceilNearestMultiple(18, 10)).toBe(20);
        });
        it("rounds 0.5 up to the nearest multiple of 10", () => {
            expect(ceilNearestMultiple(0.5, 10)).toBe(10);
        });
        it("rounds 8 up to the nearest multiple of 7", () => {
            expect(ceilNearestMultiple(8, 7)).toBe(14);
        });
        it("rounds 5 up to the nearest multiple of 7", () => {
            expect(ceilNearestMultiple(5, 7)).toBe(7);
        });
        it("rounds 7.1 up to the nearest multiple of 7", () => {
            expect(ceilNearestMultiple(7.1, 7)).toBe(14);
        });
        it("retains the nearest multiple of 10", () => {
            expect(ceilNearestMultiple(30, 10)).toBe(30);
        });
        it("retains the nearest multiple of 7", () => {
            expect(ceilNearestMultiple(14, 7)).toBe(14);
        });
    });

    describe("floorNearestMultiple()", () => {
        it("rounds 2 down to the nearest multiple of 10", () => {
            expect(floorNearestMultiple(2, 10)).toBe(0);
        });
        it("rounds 18 down to the nearest multiple of 10", () => {
            expect(floorNearestMultiple(18, 10)).toBe(10);
        });
        it("rounds 0.5 down to the nearest multiple of 10", () => {
            expect(floorNearestMultiple(0.5, 10)).toBe(0);
        });
        it("rounds 8 down to the nearest multiple of 7", () => {
            expect(floorNearestMultiple(8, 7)).toBe(7);
        });
        it("rounds 5 down to the nearest multiple of 7", () => {
            expect(floorNearestMultiple(5, 7)).toBe(0);
        });
        it("rounds 7.1 down to the nearest multiple of 7", () => {
            expect(floorNearestMultiple(7.1, 7)).toBe(7);
        });
        it("retains the nearest multiple of 10", () => {
            expect(floorNearestMultiple(30, 10)).toBe(30);
        });
        it("retains the nearest multiple of 7", () => {
            expect(floorNearestMultiple(14, 7)).toBe(14);
        });
    });
    describe("floatEq()", () => {
        it("evaluates 3.141592 and 3.141593 equal to the fifth decimal", () => {
            expect(floatEq(3.141592, 3.141593)).toBe(true);
        });
        it("evaluates 3.141592 and 3.141593 unequal to the sixth decimal", () => {
            expect(floatEq(3.141592, 3.141593, 6)).toBe(false);
        });
    });
    describe("generateBitMask()", () => {
        const bits = { A: 0b001, B: 0b010, C: 0b100 };
        const mask = bits.A | bits.B | bits.C;
        it("generates a valid bitmask", () => {
            expect(generateBitMask(bits)).toBe(mask);
        });
    });
    describe("getLineHitbox()", () => {
        it("generates a valid hitbox", () => {
            const line = getLineHitbox(0.5, 0.5, 1.5, 1.5, Math.sqrt(2));
            const result = [-0, 0, 1, 1, 2, 2, 1, 1];
            expect(line.map(Math.round)).toEqual(result);
        });
    });
    describe("isInsideRegion()", () => {
        // Define 1x1 square
        const shape = [0, 0, 0, 1, 1, 1, 1, 0];
        // Run tests
        it("evaluates (-0.5, -0.5) outside region", () => {
            expect(isInsideRegion(-0.5, -0.5, shape)).toEqual(false);
        });
        it("evaluates (0.5, 0.5) inside region", () => {
            expect(isInsideRegion(0.5, 0.5, shape)).toEqual(true);
        });
    });
    describe("isInsideShape()", () => {
        // Define 1x1 square
        const shape = [0, 0, 0, 1, 1, 1, 1, 0];
        // Run tests
        it("evaluates (-0.5, -0.5) inside region", () => {
            expect(isInsideShape(-0.5, -0.5, -1, -1, shape)).toEqual(true);
        });
        it("evaluates (0.5, 0.5) inside region", () => {
            expect(isInsideShape(0.5, 0.5, 0, 0, shape)).toEqual(true);
        });
    });
    describe("doVectorsIntersect()", () => {
        // Define vectors
        const vec1: [number, number, number, number] = [0, 0, 1, 1];
        const vec2: [number, number, number, number] = [1, 0, 0, 1];
        const vec3: [number, number, number, number] = [0, -1, 1, 0];
        // Run tests
        it("confirms vec1 and vec2 intersect", () => {
            expect(doVectorsIntersect(...vec1, ...vec2)).toEqual(true);
        });
        it("confirms vec1 and vec3 do not intersect", () => {
            expect(doVectorsIntersect(...vec1, ...vec3)).toEqual(false);
        });
    });
});
