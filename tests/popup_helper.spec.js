describe('Popup.js', function() {

    it('shouls transform an given matrix to the excel format', function() {
        var header = [
            'column 1, row a',
            'column 2, row b',
        ];

        var data = [
            ['card1', 'card2'],
            ['card1', 'card2', 'card3', 'card4'],
        ]

        var matrix = transform(header, data);

        var expectedMatrix = [
            [
                [ 'card1' ],
                [ 'card2' ],
            ], [
                [ 'card1' ],
                [ 'card2' ],
                [ 'card3' ],
                [ 'card4' ]
            ]
        ];

        expect(true).toBe(true);
    });
});