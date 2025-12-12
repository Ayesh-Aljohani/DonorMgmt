sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'donormgmt.donors',
            componentId: 'DonorsObjectPage',
            contextPath: '/Donors'
        },
        CustomPageDefinitions
    );
});