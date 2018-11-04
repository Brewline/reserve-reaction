import mockContext from "/imports/test-utils/helpers/mockContext";
import {
  rewire as rewire$getCatalogProductMedia,
  restore as restore$getCatalogProductMedia
} from "./getCatalogProductMedia";
import { rewire as rewire$isBackorder, restore as restore$isBackorder } from "./isBackorder";
import { rewire as rewire$isLowQuantity, restore as restore$isLowQuantity } from "./isLowQuantity";
import { rewire as rewire$isSoldOut, restore as restore$isSoldOut } from "./isSoldOut";
import createCatalogProduct, { restore$createCatalogProduct, rewire$xformProduct } from "./createCatalogProduct";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalCatalogItemId = "999";
const internalCatalogProductId = "999";
const internalProductId = "999";
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874"];

const productSlug = "fake-product";

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

const mockVariants = [
  {
    _id: internalVariantIds[0],
    ancestors: [internalCatalogProductId],
    barcode: "barcode",
    createdAt,
    compareAtPrice: 1100,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Untitled Option",
    originCountry: "US",
    price: 0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  },
  {
    _id: internalVariantIds[1],
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    barcode: "barcode",
    createdAt,
    height: 2,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: true,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 2,
    lowInventoryWarningThreshold: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Awesome Soft Bike",
    originCountry: "US",
    price: 992.0,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    updatedAt,
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  }
];

const mockProduct = {
  _id: internalCatalogItemId,
  shopId: internalShopId,
  barcode: "barcode",
  createdAt,
  description: "description",
  facebookMsg: "facebookMessage",
  fulfillmentService: "fulfillmentService",
  googleplusMsg: "googlePlusMessage",
  height: 11.23,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
  metafields: [
    {
      value: "value",
      namespace: "namespace",
      description: "description",
      valueType: "valueType",
      scope: "scope",
      key: "key"
    }
  ],
  metaDescription: "metaDescription",
  minOrderQuantity: 5,
  originCountry: "originCountry",
  pageTitle: "pageTitle",
  parcel: {
    containers: "containers",
    length: 4.44,
    width: 5.55,
    height: 6.66,
    weight: 7.77
  },
  pinterestMsg: "pinterestMessage",
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  media: [
    {
      metadata: {
        toGrid: 1,
        priority: 1,
        productId: internalProductId,
        variantId: null
      },
      thumbnail: "http://localhost/thumbnail",
      small: "http://localhost/small",
      medium: "http://localhost/medium",
      large: "http://localhost/large",
      image: "http://localhost/original"
    }
  ],
  productId: internalProductId,
  productType: "productType",
  shop: {
    _id: opaqueShopId
  },
  sku: "ABC123",
  supportedFulfillmentTypes: ["shipping"],
  handle: productSlug,
  hashtags: internalTagIds,
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  taxable: false,
  title: "Fake Product Title",
  twitterMsg: "twitterMessage",
  type: "product-simple",
  updatedAt,
  mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

const mockShop = {
  currencies: {
    USD: {
      enabled: true,
      format: "%s%v",
      symbol: "$"
    }
  },
  currency: "USD"
};

const mockCatalogProduct = {
  _id: "999",
  barcode: "barcode",
  createdAt,
  description: "description",
  height: 11.23,
  isBackorder: false,
  isDeleted: false,
  isLowQuantity: false,
  isSoldOut: false,
  isTaxable: false,
  isVisible: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
  media: [{
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    },
    priority: 1,
    productId: "999",
    toGrid: 1,
    variantId: "874"
  }],
  metaDescription: "metaDescription",
  metafields: [{
    description: "description",
    key: "key",
    namespace: "namespace",
    scope: "scope",
    value: "value",
    valueType: "valueType"
  }],
  originCountry: "originCountry",
  pageTitle: "pageTitle",
  parcel: {
    containers: "containers",
    height: 6.66,
    length: 4.44,
    weight: 7.77,
    width: 5.55
  },
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  pricing: {
    USD: {
      compareAtPrice: null,
      displayPrice: "$992.00",
      maxPrice: 992,
      minPrice: 992,
      price: null
    }
  },
  primaryImage: {
    URLs: {
      large: "large/path/to/image.jpg",
      medium: "medium/path/to/image.jpg",
      original: "image/path/to/image.jpg",
      small: "small/path/to/image.jpg",
      thumbnail: "thumbnail/path/to/image.jpg"
    },
    priority: 1,
    productId: "999",
    toGrid: 1,
    variantId: "874"
  },
  productId: "999",
  productType: "productType",
  shopId: "123",
  sku: "ABC123",
  slug: "fake-product",
  socialMetadata: [{
    message: "twitterMessage",
    service: "twitter"
  }, {
    message: "facebookMessage",
    service: "facebook"
  }, {
    message: "googlePlusMessage",
    service: "googleplus"
  }, {
    message: "pinterestMessage",
    service: "pinterest"
  }],
  supportedFulfillmentTypes: ["shipping"],
  tagIds: ["923", "924"],
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  title: "Fake Product Title",
  type: "product-simple",
  updatedAt,
  variants: [{
    _id: "875",
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    inventoryManagement: true,
    inventoryPolicy: false,
    isLowQuantity: true,
    isSoldOut: false,
    isTaxable: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
    media: [],
    metafields: [{
      description: "description",
      key: "key",
      namespace: "namespace",
      scope: "scope",
      value: "value",
      valueType: "valueType"
    }],
    minOrderQuantity: 0,
    optionTitle: "Untitled Option",
    options: [{
      _id: "874",
      barcode: "barcode",
      createdAt,
      height: 2,
      index: 0,
      inventoryManagement: true,
      inventoryPolicy: true,
      isLowQuantity: true,
      isSoldOut: false,
      isTaxable: true,
      length: 2,
      lowInventoryWarningThreshold: 0,
      media: [{
        URLs: {
          large: "large/path/to/image.jpg",
          medium: "medium/path/to/image.jpg",
          original: "image/path/to/image.jpg",
          small: "small/path/to/image.jpg",
          thumbnail: "thumbnail/path/to/image.jpg"
        },
        priority: 1,
        productId: "999",
        toGrid: 1,
        variantId: "874"
      }],
      metafields: [{
        description: "description",
        key: "key",
        namespace: "namespace",
        scope: "scope",
        value: "value",
        valueType: "valueType"
      }],
      minOrderQuantity: 0,
      optionTitle: "Awesome Soft Bike",
      originCountry: "US",
      price: 992,
      pricing: {
        USD: {
          compareAtPrice: null,
          displayPrice: "$992.00",
          maxPrice: 992,
          minPrice: 992,
          price: 992
        }
      },
      primaryImage: {
        URLs: {
          large: "large/path/to/image.jpg",
          medium: "medium/path/to/image.jpg",
          original: "image/path/to/image.jpg",
          small: "small/path/to/image.jpg",
          thumbnail: "thumbnail/path/to/image.jpg"
        },
        priority: 1,
        productId: "999",
        toGrid: 1,
        variantId: "874"
      },
      shopId: "123",
      sku: "sku",
      taxCode: "0000",
      taxDescription: "taxDescription",
      title: "One pound bag",
      updatedAt,
      variantId: "874",
      weight: 2,
      width: 2
    }],
    originCountry: "US",
    price: 0,
    pricing: {
      USD: {
        compareAtPrice: 1100,
        displayPrice: "$992.00",
        maxPrice: 992,
        minPrice: 992,
        price: 0
      }
    },
    primaryImage: null,
    shopId: "123",
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: "875",
    weight: 0,
    width: 0
  }],
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};


const mockGeCatalogProductMedia = jest
  .fn()
  .mockName("getCatalogProductMedia")
  .mockReturnValue(Promise.resolve([
    {
      priority: 1,
      toGrid: 1,
      productId: internalProductId,
      variantId: internalVariantIds[1],
      URLs: {
        large: "large/path/to/image.jpg",
        medium: "medium/path/to/image.jpg",
        original: "image/path/to/image.jpg",
        small: "small/path/to/image.jpg",
        thumbnail: "thumbnail/path/to/image.jpg"
      }
    }
  ]));

const mockIsBackorder = jest
  .fn()
  .mockName("isBackorder")
  .mockReturnValue(false);
const mockIsLowQuantity = jest
  .fn()
  .mockName("isLowQuantity")
  .mockReturnValue(false);
const mockIsSoldOut = jest
  .fn()
  .mockName("isSoldOut")
  .mockReturnValue(false);

beforeAll(() => {
  rewire$getCatalogProductMedia(mockGeCatalogProductMedia);
  rewire$isBackorder(mockIsBackorder);
  rewire$isLowQuantity(mockIsLowQuantity);
  rewire$isSoldOut(mockIsSoldOut);
});

afterAll(() => {
  restore$isBackorder();
  restore$isLowQuantity();
  restore$isSoldOut();
  restore$getCatalogProductMedia();
  restore$createCatalogProduct();
});

test("convert product object to catalog object", async () => {
  mockContext.collections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));
  const spec = await createCatalogProduct(mockProduct, mockContext);

  expect(spec).toEqual(mockCatalogProduct);
});

test("calls functions of type publishProductToCatalog, which can mutate the catalog product", async () => {
  mockContext.collections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));

  rewire$xformProduct(() => ({ mock: true }));

  const mockCustomPublisher = jest.fn().mockName("mockCustomPublisher").mockImplementation((obj) => {
    obj.foo = "bar";
  });

  const catalogProduct = await createCatalogProduct({}, {
    ...mockContext,
    getFunctionsOfType: () => [mockCustomPublisher]
  });

  expect(catalogProduct).toEqual({ foo: "bar", mock: true });
  expect(mockCustomPublisher).toHaveBeenCalledWith({ foo: "bar", mock: true }, {
    context: jasmine.any(Object),
    product: {},
    shop: mockShop,
    variants: mockVariants
  });
});
