describe('Popup.js', function() {

    it('shouls transform an given matrix to the excel format', function() {
        let header = [
            'column 1, row a',
            'column 2, row b',
        ];

        var data = [
            ['card1', 'card2'],
            ['card1', 'card2', 'card3', 'card4'],
        ]

        var matrix = transformMatrix(header, data);

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

        expect(expectedMatrix).toBe(matrix);
    })
});