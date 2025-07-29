/* eslint-disable @typescript-eslint/no-floating-promises */
import { expect } from 'chai';
import { describe, it } from 'node:test';

import { createWhitespaceData, getSeriesDataCreator } from '../../src/api/get-series-data-creator';
import { UTCTimestamp } from '../../src/model/horz-scale-behavior-time/types';
import { InternalHorzScaleItem } from '../../src/model/ihorz-scale-behavior';
import { PlotRow } from '../../src/model/plot-data';
import { BarPlotRow, LinePlotRow } from '../../src/model/series-data';
import { TimePointIndex } from '../../src/model/time-data';

describe('Series data with whitespace', () => {
	it('should create whitespace data correctly', () => {
		const whitespaceData = createWhitespaceData(1649931070 as UTCTimestamp);

		expect(whitespaceData).to.deep.equal({
			time: 1649931070,
		});
	});

	it('should handle series data creation with plot rows', () => {
		const plotRow: PlotRow = {
			index: 0 as TimePointIndex,
			time: { timestamp: 1649931070 as UTCTimestamp } as unknown as InternalHorzScaleItem,
			value: [1, 2, 3, 4],
			originalTime: 1649931070 as UTCTimestamp,
		};

		const linePlotRow: LinePlotRow = {
			...plotRow,
			color: '#FF0000',
		};

		const lineCreator = getSeriesDataCreator('Line');
		const lineData = lineCreator(linePlotRow);

		expect(lineData).to.deep.equal({
			value: 4,
			time: 1649931070,
			color: '#FF0000',
		});
	});

	it('should handle bar series data creation with plot rows', () => {
		const plotRow: PlotRow = {
			index: 0 as TimePointIndex,
			time: { timestamp: 1649931070 as UTCTimestamp } as unknown as InternalHorzScaleItem,
			value: [100, 105, 95, 102],
			originalTime: 1649931070 as UTCTimestamp,
		};

		const barPlotRow: BarPlotRow = {
			...plotRow,
			color: '#0000FF',
		};

		const barCreator = getSeriesDataCreator('Bar');
		const barData = barCreator(barPlotRow);

		expect(barData).to.deep.equal({
			open: 100,
			high: 105,
			low: 95,
			close: 102,
			time: 1649931070,
			color: '#0000FF',
		});
	});
});
