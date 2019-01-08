import navigationTreeByIdResolver from "./navigationTreeById";

const opaqueNavigationTreeId = "cmVhY3Rpb24vbmF2aWdhdGlvblRyZWU6cGtNVFdBRUhKcnNpTnpZMmE=";
const decodedNavigationTreeId = "pkMTWAEHJrsiNzY2a";

const mockNavigationTree = {
  _id: decodedNavigationTreeId,
  name: "Main Navigation",
  draftItems: [
    {
      navigationItem: {
        _id: "wYWSrwT2bWDE9aHLg"
      },
      items: [
        {
          navigationItem: {
            _id: "KEcn6NvrRuztmPMq8"
          },
          items: []
        },
        {
          navigationItem: {
            _id: "tAKATQeqoD4Ah5gg2"
          },
          items: [
            {
              navigationItem: {
                _id: "uaXXawc5oxy9eR4hP"
              }
            }
          ]
        }
      ]
    }
  ],
  items: [],
  hasUnpublishedChanges: true
};

test("calls queries.navigationTreeById and returns a navigation tree", async () => {
  const navigationTreeById = jest.fn()
    .mockName("queries.navigationTreeById")
    .mockReturnValueOnce(Promise.resolve(mockNavigationTree));

  const result = await navigationTreeByIdResolver({}, { id: opaqueNavigationTreeId, language: "en" }, {
    queries: { navigationTreeById }
  });

  expect(result).toEqual(mockNavigationTree);

  expect(navigationTreeById).toHaveBeenCalled();
  expect(navigationTreeById.mock.calls[0][1]).toEqual("en");
  expect(navigationTreeById.mock.calls[0][2]).toEqual(decodedNavigationTreeId);
});
