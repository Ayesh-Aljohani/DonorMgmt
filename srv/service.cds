using { DonorMgmt as my } from '../db/schema.cds';

@path : '/service/donorMgmt'
service donorMgmtSrv
{
    @odata.draft.enabled
    entity Donors as
        projection on my.Donors
        actions
        {
            action DonorSummary
            (
            )
            returns Donors;

            action DonorEngagementRecommendation
            (
            )
            returns Donors;
        };

    @odata.draft.enabled
    entity Donations as
        projection on my.Donations;
}

annotate donorMgmtSrv with @requires :
[
    'authenticated-user'
];
