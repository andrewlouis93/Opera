$(function() {

    function hyst_graph(mud_intervals, Tf, Vf, SdTf, EQ, option1)
    {
        var d1 = [];
        var alpha_intervals = numeric.linspace(0.1,0.6,mud_intervals);
        for (var i = 0; i < mud_intervals; i += 1) {
            var alpha = alpha_intervals[i];
            var temp = hyst_SPECTRA(alpha, i, Tf, Vf, SdTf, EQ, option1);
            var Ra = temp["Ra"];
            var Rd = temp["Rd"];
            d1.push([Ra, Rd]);
        }
        $.plot("#placeholder", [d1] );
    }

    $('#Run').click(function(){
        hyst_graph(
            parseFloat(document.getElementById('mud_input').value),
            parseFloat(document.getElementById('Tf_input').value),
            parseFloat(document.getElementById('Vf_input').value),
            parseFloat(document.getElementById('SdTf_input').value),
            parseFloat(document.getElementById('EQ_input').value),
            parseFloat(document.getElementById('option_input').value));
    });


});