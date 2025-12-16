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
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Summary & Next Steps',
            ID : 'SummaryNextSteps',
            Target : '@UI.FieldGroup#SummaryNextSteps',
        },
    ],
    UI.FieldGroup #SummaryNextSteps : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataFieldForAction',
                Action : 'donorMgmtSrv.DonorSummary',
                Label : 'Generate Summary',
            },
            {
                $Type : 'UI.DataField',
                Value : summary,
            },
            {
                $Type : 'UI.DataFieldForAction',
                Action : 'donorMgmtSrv.generateDonorEngagementRecommendation',
                Label : 'Generate Next Steps',
            },
            {
                $Type : 'UI.DataField',
                Value : nextstep,
            },

            // ✅ Predict Likelihood button + show results
            {
                $Type : 'UI.DataFieldForAction',
                Action : 'donorMgmtSrv.donationLikelihoodScore',
                Label : 'Predict Donation Likelihood',
            },
            {
                $Type : 'UI.DataField',
                Label : 'Donation Likelihood',
                Value : donationLikelihoodLabel,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Likelihood Score',
                Value : donationLikelihoodScore,
            },
        ],
    },
    UI.FieldGroup #Main : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : name,
            },
            {
                $Type : 'UI.DataField',
                Value : email,
            },
            {
                $Type : 'UI.DataField',
                Value : phone,
            },
            {
                $Type : 'UI.DataField',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Value : donorType,
            },
            {
                $Type : 'UI.DataField',
                Value : isRecurringDonor,
            },
            {
                $Type : 'UI.DataField',
                Value : isHNI,
            },
            {
                $Type : 'UI.DataField',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Value : createdBy,
            },
            {
                $Type : 'UI.DataField',
                Value : modifiedAt,
            },
            {
                $Type : 'UI.DataField',
                Value : modifiedBy,
            },
        ],
    },
);

annotate service.Donations with @(
    UI.LineItem #Donations : [
        {
            $Type : 'UI.DataField',
            Value : campaign,
        },
        {
            $Type : 'UI.DataField',
            Value : cause,
        },
        {
            $Type : 'UI.DataField',
            Value : city,
        },
        {
            $Type : 'UI.DataField',
            Value : amount,
        },
        {
            $Type : 'UI.DataField',
            Value : currencyCode,
        },
        {
            $Type : 'UI.DataField',
            Value : donationDate,
        },
    ]
);

annotate service.Donors with {
    summary @(
        UI.MultiLineText : true,
        Common.FieldControl : #ReadOnly,
    );
    nextstep @(
        UI.MultiLineText : true,
        Common.FieldControl : #ReadOnly,
    );

    // ✅ Likelihood fields
    donationLikelihoodLabel @(
        Common.FieldControl : #ReadOnly,
    );
    donationLikelihoodScore @(
        Common.FieldControl : #ReadOnly,
    );
};

annotate donorMgmtSrv.Donors actions {
    donationLikelihoodScore @(
        Common.SideEffects : {
            TargetProperties : [
                'donationLikelihoodScore',
                'donationLikelihoodLabel'
            ]
        }
    );
};