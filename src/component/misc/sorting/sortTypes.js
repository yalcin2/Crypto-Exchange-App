const SortTypes = {
    // amount 1 sorting
    up_amount1: {
      class: 'sort-up',
      fn: (a, b) => b.amount1 - a.amount1
    },
    down_amount1: {
      class: 'sort-down',
      fn: (a, b) => a.amount1 - b.amount1
    },
    default_amount1: {
      class: 'sort',
      fn: (a, b) => a
    },
    // amount 2 sorting
    up_amount2: {
      class: 'sort-up',
      fn: (a, b) => b.amount2 - a.amount2
    },
    down_amount2: {
      class: 'sort-down',
      fn: (a, b) => a.amount2 - b.amount2
    },
    default_amount2: {
      class: 'sort',
      fn: (a, b) => a
    },
    // currency from sorting
    up_currencyFrom: {
        class: 'sort-up',
        fn: (a, b) => {
            if (a.currencyFrom < b.currencyFrom) {
                return -1;
            }
            if (a.currencyFrom > b.currencyFrom) {
                return 1;
            }
            return 0;
        }
    },
    down_currencyFrom: {
        class: 'sort-down',
        fn: (a, b) => {
            if (b.currencyFrom < a.currencyFrom) {
                return -1;
            }
            if (b.currencyFrom > a.currencyFrom) {
                return 1;
            }
            return 0;
        }
    },
    default_currencyFrom: {
        class: 'sort',
        fn: (a, b) => a
    },
    // currency to sorting
    up_currencyTo: {
        class: 'sort-up',
        fn: (a, b) => {
            if (a.currencyTo < b.currencyTo) {
                return -1;
            }
            if (a.currencyTo > b.currencyTo) {
                return 1;
            }
            return 0;
        }
    },
    down_currencyTo: {
        class: 'sort-down',
        fn: (a, b) => {
            if (b.currencyTo < a.currencyTo) {
                return -1;
            }
            if (b.currencyTo > a.currencyTo) {
                return 1;
            }
            return 0;
        }
    },
    default_currencyTo: {
        class: 'sort',
        fn: (a, b) => a
    },
    // date time sorting
    up_dateTime: {
        class: 'sort-up',
        fn: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    },
    down_dateTime: {
        class: 'sort-down',
        fn: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    },
    default_dateTime: {
        class: 'sort',
        fn: (a, b) => a
    },
    // type sorting
    up_type: {
        class: 'sort-up',
        fn: (a, b) => {
            if (a.type < b.type) {
                return -1;
            }
            if (a.type > b.type) {
                return 1;
            }
            return 0;
        }
    },
    down_type: {
        class: 'sort-down',
        fn: (a, b) => {
            if (b.type < a.type) {
                return -1;
            }
            if (b.type > a.type) {
                return 1;
            }
            return 0;
        }
    },
    default_type: {
        class: 'sort',
        fn: (a, b) => a
    },
    // Default sort.
    default: {
        class: 'sort',
        fn: (a, b) => a
    },
  };


export { SortTypes };