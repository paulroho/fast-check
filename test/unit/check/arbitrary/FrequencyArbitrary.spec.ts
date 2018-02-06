import * as assert from 'power-assert';
import * as fc from '../../../../lib/fast-check';

import { frequency } from '../../../../src/check/arbitrary/FrequencyArbitrary';
import { oneof } from '../../../../src/check/arbitrary/OneOfArbitrary';

import * as stubArb from '../../stubs/arbitraries';
import * as stubRng from '../../stubs/generators';

describe('FrequencyArbitrary', () => {
    describe('frequency', () => {
        const MAX_WEIGHT = 100;
        const weightArb = () => fc.tuple(fc.integer(), fc.integer(1, MAX_WEIGHT));
        const rng = (seed) => stubRng.mutable.fastincrease(seed);
        it('Should produce the same as oneof when called on weights of 1', () => fc.assert(
            fc.property(fc.integer(), fc.integer(), fc.array(fc.integer()), (seed, choice1, others) => {
                const gFreq = frequency(
                        {weight: 1, arbitrary: stubArb.counter(choice1)},
                        ...others.map(c => Object({weight: 1, arbitrary: stubArb.counter(c)}))
                    ).generate(rng(seed)).value;
                const gOneOf = oneof(
                        stubArb.counter(choice1),
                        ...others.map(stubArb.counter)
                    ).generate(rng(seed)).value;
                return gFreq == gOneOf;
            })
        ));
        it('Should produce the same as oneof with sum of weights elements', () => fc.assert(
            fc.property(fc.integer(), weightArb(), fc.array(weightArb()), (seed, choice1, others) => {
                const expand = (value: number, num: number): number[] => [...Array(num)].map(() => value);

                const othersOneOf = [choice1, ...others]
                    .reduce((p,c) => p.concat(...expand(c[0], c[1])), [])
                    .slice(1);

                const gFreq = frequency(
                        {weight: choice1[1], arbitrary: stubArb.counter(choice1[0])},
                        ...others.map(c => Object({weight: c[1], arbitrary: stubArb.counter(c[0])}))
                    ).generate(rng(seed)).value;
                const gOneOf = oneof(
                        stubArb.counter(choice1[0]),
                        ...othersOneOf.map(stubArb.counter)
                    ).generate(rng(seed)).value;
                return gFreq == gOneOf;
            })
        ));
    });
});