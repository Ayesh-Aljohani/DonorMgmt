sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"donormgmt/donors/test/integration/pages/DonorsList",
	"donormgmt/donors/test/integration/pages/DonorsObjectPage",
	"donormgmt/donors/test/integration/pages/DonationsObjectPage"
], function (JourneyRunner, DonorsList, DonorsObjectPage, DonationsObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('donormgmt/donors') + '/test/flpSandbox.html#donormgmtdonors-tile',
        pages: {
			onTheDonorsList: DonorsList,
			onTheDonorsObjectPage: DonorsObjectPage,
			onTheDonationsObjectPage: DonationsObjectPage
        },
        async: true
    });

    return runner;
});

