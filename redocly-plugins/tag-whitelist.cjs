const httpMethods = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
];

module.exports = {
  id: 'tag-whitelist',
  decorators: {
    oas3: {
      only: ({tags}) => {
        const allowedTags = new Set(tags);

        return {
          PathItem: {
            enter(pathItem, {parent, key}) {
              for (const method of httpMethods) {
                const operation = pathItem[method];
                const isAllowed = operation?.tags?.some((tag) => allowedTags.has(tag));
                if (operation && !isAllowed) {
                  delete pathItem[method];
                }
              }

              const hasOperation = httpMethods.some((method) => pathItem[method]);
              if (!hasOperation) delete parent[key];
            },
          },
        };
      },
    },
  },
};
