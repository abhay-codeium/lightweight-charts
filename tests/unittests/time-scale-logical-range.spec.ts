/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { describe, it } from 'node:test';

import { timeScaleOptionsDefaults } from '../../src/api/options/time-scale-options-defaults';
import { ChartModel } from '../../src/model/chart-model';
import { HorzScaleBehaviorTime } from '../../src/model/horz-scale-behavior-time/horz-scale-behavior-time';
import { Time, UTCTimestamp } from '../../src/model/horz-scale-behavior-time/types';
import { InternalHorzScaleItem } from '../../src/model/ihorz-scale-behavior';
import { LocalizationOptions } from '../../src/model/localization-options';
import { Logical, LogicalRange, TickMarkWeightValue, TimePointIndex, TimeScalePoint } from '../../src/model/time-data';
import { TimeScale } from '../../src/model/time-scale';

function chartModelMock(): ChartModel<Time> {
	// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
	return {
		recalculateAllPanes: () => {},
		lightUpdate: () => {},
	} as ChartModel<Time>;
}

function createTimeScalePoints(count: number): [TimeScalePoint[], TimePointIndex] {
	const points: TimeScalePoint[] = [];
	for (let i = 0; i < count; i++) {
		points.push({
			time: { timestamp: i as UTCTimestamp } as unknown as InternalHorzScaleItem,
			timeWeight: 20 as TickMarkWeightValue,
			originalTime: i as UTCTimestamp,
		});
	}
	return [points, 0 as TimePointIndex];
}

const behavior = new HorzScaleBehaviorTime();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fakeLocalizationOptions: LocalizationOptions<Time> = {} as any;

describe('TimeScale logical range handling', () => {
	it('should handle narrow fractional logical ranges correctly', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			{ ...timeScaleOptionsDefaults, minBarSpacing: 0, maxBarSpacing: 100000 },
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(2));
		timeScale.setBaseIndex(1 as TimePointIndex);

		const narrowRange: LogicalRange = { from: 0.49 as Logical, to: 0.51 as Logical };
		timeScale.setLogicalRange(narrowRange);

		const visibleRange = timeScale.visibleLogicalRange();
		expect(visibleRange).to.not.be.null;

		if (visibleRange !== null) {
			const rangeWidth = visibleRange.right() - visibleRange.left();
			expect(rangeWidth).to.be.greaterThan(0);
			expect(rangeWidth).to.be.approximately(0.02, 0.1);
		}
	});

	it('should handle integer logical ranges as before', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			timeScaleOptionsDefaults,
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(4));
		timeScale.setBaseIndex(3 as TimePointIndex);

		const integerRange: LogicalRange = { from: 1 as Logical, to: 3 as Logical };
		timeScale.setLogicalRange(integerRange);

		const visibleRange = timeScale.visibleLogicalRange();
		expect(visibleRange).to.not.be.null;

		if (visibleRange !== null) {
			const rangeWidth = visibleRange.right() - visibleRange.left();
			expect(rangeWidth).to.be.greaterThan(1.5);
			expect(rangeWidth).to.be.lessThan(2.5);
		}
	});

	it('should respect bar spacing constraints for narrow ranges', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			{ ...timeScaleOptionsDefaults, minBarSpacing: 10, maxBarSpacing: 50 },
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(2));
		timeScale.setBaseIndex(1 as TimePointIndex);

		const narrowRange: LogicalRange = { from: 0.49 as Logical, to: 0.51 as Logical };
		timeScale.setLogicalRange(narrowRange);

		const barSpacing = timeScale.barSpacing();
		expect(barSpacing).to.be.at.least(10);
		expect(barSpacing).to.be.at.most(50);
	});

	it('should handle zero-width ranges gracefully', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			timeScaleOptionsDefaults,
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(2));
		timeScale.setBaseIndex(1 as TimePointIndex);

		const originalBarSpacing = timeScale.barSpacing();
		const zeroRange: LogicalRange = { from: 0.5 as Logical, to: 0.5 as Logical };

		timeScale.setLogicalRange(zeroRange);

		expect(timeScale.barSpacing()).to.equal(originalBarSpacing);
	});

	it('should handle negative-width ranges gracefully', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			timeScaleOptionsDefaults,
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(2));
		timeScale.setBaseIndex(1 as TimePointIndex);

		const originalBarSpacing = timeScale.barSpacing();
		const invalidRange: LogicalRange = { from: 0.6 as Logical, to: 0.4 as Logical };

		timeScale.setLogicalRange(invalidRange);

		expect(timeScale.barSpacing()).to.equal(originalBarSpacing);
	});

	it('should handle very small fractional ranges', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			{ ...timeScaleOptionsDefaults, minBarSpacing: 0, maxBarSpacing: 100000 },
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(2));
		timeScale.setBaseIndex(1 as TimePointIndex);

		const tinyRange: LogicalRange = { from: 0.499 as Logical, to: 0.501 as Logical };
		timeScale.setLogicalRange(tinyRange);

		const visibleRange = timeScale.visibleLogicalRange();
		expect(visibleRange).to.not.be.null;

		if (visibleRange !== null) {
			const rangeWidth = visibleRange.right() - visibleRange.left();
			expect(rangeWidth).to.be.greaterThan(0);
		}
	});

	it('should center the range correctly', () => {
		const timeScale = new TimeScale<Time>(
			chartModelMock(),
			timeScaleOptionsDefaults,
			fakeLocalizationOptions,
			behavior
		);
		timeScale.setWidth(400);
		timeScale.update(...createTimeScalePoints(3));
		timeScale.setBaseIndex(2 as TimePointIndex);

		const centeredRange: LogicalRange = { from: 0.9 as Logical, to: 1.1 as Logical };
		timeScale.setLogicalRange(centeredRange);

		const visibleRange = timeScale.visibleLogicalRange();
		expect(visibleRange).to.not.be.null;

		if (visibleRange !== null) {
			const center = (visibleRange.left() + visibleRange.right()) / 2;
			expect(center).to.be.approximately(1.0, 0.5);
		}
	});
});
