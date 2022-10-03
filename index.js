const app = new Vue({
  el: '#app',
  filters: {
    currency(val) {
      return parseFloat(val).toFixed(2);
    },
  },
  computed: {
    year() {
      const date = new Date();

      return date.getFullYear();
    },
    date() {
      const date = new Date();

      return `${date.getFullYear}-${date.get}`;
    },
    subtotal() {
      const items = this.form.items;

      return items.reduce(
        (total, item) => (total += item.qty * item.price),
        0
      );
    },
    total() {
      const total = parseFloat(this.subtotal);
      const tax =
        (total * parseFloat(this.form.tax || 0)) / 100;
      return total + tax;
    },
    balanceDue() {
      return (
        parseFloat(this.total) -
        parseFloat(this.form.paid || 0)
      );
    },
    table() {
      const table = [];
      const header = [
        { text: 'ITEM', style: 'headerLeft' },
        { text: 'QTY', style: 'headerRight' },
        { text: 'PRICE', style: 'headerRight' },
        { text: 'AMOUNT', style: 'headerRight' },
      ];
      const filler = ['', '', '', ''];

      table.push(header);

      this.form.items.forEach((item) => {
        table.push([
          {
            text: item.desc,
            alignment: 'left',
            style: 'lineItem',
          },
          {
            text: item.qty,
            alignment: 'right',
            style: 'lineItem',
          },
          {
            text: this.toCurrency(item.price || 0),
            alignment: 'right',
            style: 'lineItem',
          },
          {
            text: this.toCurrency(
              (item.qty || 1) * item.price
            ),
            alignment: 'right',
            style: 'lineItem',
          },
        ]);
      });

      table.push(filler);

      return table;
    },
    template() {
      return {
        defaultStyle: {
          fontSize: 10,
          pageSize: 'LETTER',
        },
        content: [
          {
            columns: [
              [
                {
                  image:
                    this.form.logo || 'blank',
                  fit: this.form.logo
                    ? [200, 80]
                    : [0, 0],
                  margin: [0, 0, 0, 10],
                },
                this.form.from,
                {
                  text: 'BILL TO',
                  fontSize: 10,
                  margin: [0, 20, 0, 0],
                  bold: true,
                },
                this.form.to,
              ],
              [
                {
                  text: 'INVOICE',
                  alignment: 'right',
                  fontSize: 24,
                  margin: [0, 0, 0, 20],
                },
                {
                  columns: [
                    {
                      stack: [
                        'Invoice #',
                        'Date',
                        'Terms',
                        'Due Date',
                      ],
                      alignment: 'right',
                      fontSize: 10,
                      bold: true,
                      lineHeight: 1.5,
                    },
                    {
                      stack: [
                        this.form
                          .invoiceNum ||
                          1,
                        this.form
                          .invoiceDate,
                        this.form.terms ||
                          ' ',
                        this.form.dueDate,
                      ],
                      alignment: 'right',
                      fontSize: 10,
                      lineHeight: 1.5,
                    },
                  ],
                },
              ],
            ],
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 100, 100, 100],
              body: this.table,
            },
            margin: [0, 20, 0, 0],
            layout: 'lightHorizontalLines',
          },
          {
            columns: [
              [
                {
                  table: {
                    headerRows: 1,
                    widths: ['*'],
                    body: [
                      [
                        {
                          text: 'Notes',
                          fillColor:
                            'black',
                          color: 'white',
                        },
                      ],
                      [
                        {
                          text:
                            this.form
                              .notes ||
                            '\n\n\n\n\n',
                        },
                      ],
                    ],
                  },
                  margin: [0, 20, 0, 0],
                },
              ],
              {
                columns: [
                  '',
                  {
                    stack: [
                      'Subtotal',
                      // 'Discount',
                      'Tax %',
                      'Total',
                      // 'Amount Paid',
                      {
                        text: 'Balance Due',
                        bold: true,
                      },
                    ],
                    alignment: 'right',
                    lineHeight: 1.5,
                  },
                  {
                    stack: [
                      this.toCurrency(
                        this.subtotal || 0
                      ),
                      // `- ${this.toCurrency(
                      // 	this.form
                      // 		.discount || 0
                      // )}`,
                      this.form.tax || 0,
                      this.toCurrency(
                        this.total || 0
                      ),
                      // `- ${this.toCurrency(
                      // 	this.form.paid || 0
                      // )}`,
                      {
                        text: this.toCurrency(
                          this
                            .balanceDue ||
                            0
                        ),
                        bold: true,
                      },
                    ],
                    alignment: 'right',
                    lineHeight: 1.5,
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          headerLeft: {
            bold: true,
            color: 'black',
            alignment: 'left',
            margin: [0, 0, 0, 4],
          },
          headerRight: {
            bold: true,
            color: 'black',
            alignment: 'right',
            margin: [0, 0, 0, 4],
          },
          lineItem: {
            margin: [0, 5, 0, 5],
          },
          header: {
            background: 'black',
            color: 'white',
          },
        },
        images: {
          blank: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=',
        },
      };
    },
  },
  data: () => ({
    form: {
      logo: null,
      from: null,
      to: null,
      invoiceNum: 1,
      invoiceDate: null,
      terms: null,
      dueDate: null,
      items: [],
      notes: null,
      // discount: '',
      tax: null,
      // paid: '',
    },
  }),
  methods: {
    removeItem(index) {
      this.form.items.splice(index, 1);
    },
    previewHandler() {
      const valid = this.$refs.form.reportValidity();

      if (!valid) return;

      let vm = this;

      pdfMake.fonts = {
        Roboto: {
          normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
        },
      };

      pdfMake.createPdf(this.template).open();
    },
    fileHandler(e) {
      if (!e.target.files.length) return;
      let vm = this;
      var reader = new FileReader();
      reader.onload = function (e) {
        const image = document.createElement('img');
        image.classList.add('max-h-40');
        image.classList.add('object-contain');
        vm.form.logo = e.target.result;

        image.src = e.target.result;
        const child = vm.$refs.logo.childNodes[0];
        vm.$refs.logo.replaceChild(image, child);
      };
      reader.readAsDataURL(e.target.files[0]);
    },
    removeLogo() {
      this.form.logo = null;
      const div = document.createElement('div');
      div.classList.add('p-8');
      div.innerText = '+ Add your logo';
      const child = this.$refs.logo.childNodes[0];
      this.$refs.logo.replaceChild(div, child);
    },
    toCurrency(val) {
      return `$ ${parseFloat(val).toFixed(2)}`;
    },
    addItem() {
      this.form.items.push({
        desc: null,
        qty: null,
        price: null,
      });
    },
  },
  mounted() {
    const today = new Date().toISOString().split('T')[0];
    this.form.invoiceDate = today;
    this.form.dueDate = today;
    this.addItem();
  },
});
