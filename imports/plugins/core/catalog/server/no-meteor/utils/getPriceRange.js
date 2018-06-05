import accounting from "accounting-js";

/**
 * A wrapper around accounting.formatMoney that handles minor differences between Reaction
 * API and accounting.js API.
 * @param {Number} price - A price (float)
 * @param {Object} [currencyInfo] - A currency object in Reaction schema
 * @returns Formatted currency string such as "$15.99". If `currencyInfo` is not provided,
 *   returns `accounting.toFixed(price, 2)`.
 */
function formatMoney(price, currencyInfo) {
  // Implementation of toFixed() that treats floats more like decimal values than binary,
  // fixing inconsistent precision rounding in JavaScript (where some .05 values round up,
  // while others round down):
  if (!currencyInfo) return accounting.toFixed(price, 2);

  // If there are no decimal places, in the case of the Japanese Yen, we adjust it here.
  let priceToFormat = price;
  if (currencyInfo.scale === 0) {
    priceToFormat = price * 100;
  }

  const currencyFormatSettings = { ...currencyInfo };

  // Precision is mis-used in accounting js. Scale is the propery term for number
  // of decimal places. Let's adjust it here so accounting.js does not break.
  if (typeof currencyInfo.scale === "number") {
    currencyFormatSettings.precision = currencyInfo.scale;
  }

  return accounting.formatMoney(priceToFormat, currencyFormatSettings);
}

/**
 *
 * @method getPriceRange
 * @summary Get Price object from array of Product prices
 * @param {Array} prices - Array of Product price properties
 * @param {Object} [currencyInfo] - A currency object in Reaction schema
 * @return {Promise<Object>} PriceRange object
 */
export default function getPriceRange(prices, currencyInfo) {
  if (prices.length === 1) {
    return {
      range: formatMoney(prices[0], currencyInfo),
      min: prices[0],
      max: prices[0]
    };
  }

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = Number.NEGATIVE_INFINITY;

  prices.forEach((price) => {
    if (price < priceMin) {
      priceMin = price;
    }
    if (price > priceMax) {
      priceMax = price;
    }
  });

  if (priceMin === priceMax) {
    return {
      range: formatMoney(priceMin, currencyInfo),
      min: priceMin,
      max: priceMax
    };
  }
  return {
    range: `${formatMoney(priceMin, currencyInfo)} - ${formatMoney(priceMax, currencyInfo)}`,
    min: priceMin,
    max: priceMax
  };
}
