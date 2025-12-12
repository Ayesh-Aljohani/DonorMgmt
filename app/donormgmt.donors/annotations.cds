using donorMgmtSrv as service from '../../srv/service';
using from '../annotations';

annotate service.Donors with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'Main',
            Label : 'General Information',
            Target : '@UI.FieldGroup#Main',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Donations',
            ID : 'Donations',
            Target : 'donations/@UI.LineItem#Donations',
        },
    ]
);

annotate service.Donations with @(
    UI.LineItem #Donations : [
    ]
);

