using { donorMgmtSrv } from '../srv/service.cds';
//using donorMgmtSrv from '../srv/service';

annotate donorMgmtSrv.Donors with @UI.HeaderInfo: { TypeName: 'Donor', TypeNamePlural: 'Donors', Title: { Value: name } };
annotate donorMgmtSrv.Donors with {
  ID @UI.Hidden @Common.Text: { $value: name, ![@UI.TextArrangement]: #TextOnly }
};
annotate donorMgmtSrv.Donors with @UI.Identification: [{ Value: name }];
annotate donorMgmtSrv.Donors with {
  name @title: 'Name';
  email @title: 'Email';
  phone @title: 'Phone';
  status @title: 'Status';
  donorType @title: 'Donor Type';
  isRecurringDonor @title: 'Is Recurring Donor';
  isHNI @title: 'Is HNI';
  summary @title: 'Summary';
  nextstep @title: 'Next Step';
  createdAt @title: 'Created At';
  createdBy @title: 'Created By';
  modifiedAt @title: 'Modified At';
  modifiedBy @title: 'Modified By'
};

annotate donorMgmtSrv.Donors with @UI.LineItem: [
 { $Type: 'UI.DataField', Value: name },
 { $Type: 'UI.DataField', Value: email },
 { $Type: 'UI.DataField', Value: phone },
 { $Type: 'UI.DataField', Value: status },
 { $Type: 'UI.DataField', Value: donorType },
 { $Type: 'UI.DataField', Value: isRecurringDonor },
 { $Type: 'UI.DataField', Value: isHNI },
 { $Type: 'UI.DataField', Value: summary },
 { $Type: 'UI.DataField', Value: nextstep }
];

annotate donorMgmtSrv.Donors with @UI.FieldGroup #Main: {
  $Type: 'UI.FieldGroupType', Data: [
 { $Type: 'UI.DataField', Value: name },
 { $Type: 'UI.DataField', Value: email },
 { $Type: 'UI.DataField', Value: phone },
 { $Type: 'UI.DataField', Value: status },
 { $Type: 'UI.DataField', Value: donorType },
 { $Type: 'UI.DataField', Value: isRecurringDonor },
 { $Type: 'UI.DataField', Value: isHNI },
 { $Type: 'UI.DataField', Value: summary },
 { $Type: 'UI.DataField', Value: nextstep },
 { $Type: 'UI.DataField', Value: createdAt },
 { $Type: 'UI.DataField', Value: createdBy },
 { $Type: 'UI.DataField', Value: modifiedAt },
 { $Type: 'UI.DataField', Value: modifiedBy }
  ]
};

annotate donorMgmtSrv.Donors with {
  donations @Common.Label: 'Donations'
};

annotate donorMgmtSrv.Donors with @UI.Facets: [
  { $Type: 'UI.ReferenceFacet', ID: 'Main', Label: 'General Information', Target: '@UI.FieldGroup#Main' }
];

annotate donorMgmtSrv.Donors with @UI.SelectionFields: [
  name
];

annotate donorMgmtSrv.Donations with @UI.HeaderInfo: { TypeName: 'Donation', TypeNamePlural: 'Donations' };
annotate donorMgmtSrv.Donations with {
  donor @Common.ValueList: {
    CollectionPath: 'Donors',
    Parameters    : [
      {
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: donor_ID, 
        ValueListProperty: 'ID'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'name'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'email'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'phone'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'status'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'donorType'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'isRecurringDonor'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'isHNI'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'summary'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'nextstep'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'createdAt'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'createdBy'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'modifiedAt'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'modifiedBy'
      },
    ],
  }
};
annotate donorMgmtSrv.Donations with {
  donorName @title: 'Donor Name';
  donorEmail @title: 'Donor Email';
  donorPhone @title: 'Donor Phone';
  city @title: 'City';
  amount @title: 'Amount';
  currencyCode @title: 'Currency Code';
  donationDate @title: 'Donation Date';
  cause @title: 'Cause';
  campaign @title: 'Campaign';
  createdAt @title: 'Created At';
  createdBy @title: 'Created By';
  modifiedAt @title: 'Modified At';
  modifiedBy @title: 'Modified By'
};

annotate donorMgmtSrv.Donations with @UI.LineItem: [
 { $Type: 'UI.DataField', Value: donorName },
 { $Type: 'UI.DataField', Value: donorEmail },
 { $Type: 'UI.DataField', Value: donorPhone },
 { $Type: 'UI.DataField', Value: city },
 { $Type: 'UI.DataField', Value: amount },
 { $Type: 'UI.DataField', Value: currencyCode },
 { $Type: 'UI.DataField', Value: donationDate },
 { $Type: 'UI.DataField', Value: cause },
 { $Type: 'UI.DataField', Value: campaign },
    { $Type: 'UI.DataField', Label: 'Donor', Value: donor_ID }
];

annotate donorMgmtSrv.Donations with @UI.FieldGroup #Main: {
  $Type: 'UI.FieldGroupType', Data: [
 { $Type: 'UI.DataField', Value: donorName },
 { $Type: 'UI.DataField', Value: donorEmail },
 { $Type: 'UI.DataField', Value: donorPhone },
 { $Type: 'UI.DataField', Value: city },
 { $Type: 'UI.DataField', Value: amount },
 { $Type: 'UI.DataField', Value: currencyCode },
 { $Type: 'UI.DataField', Value: donationDate },
 { $Type: 'UI.DataField', Value: cause },
 { $Type: 'UI.DataField', Value: campaign },
 { $Type: 'UI.DataField', Value: createdAt },
 { $Type: 'UI.DataField', Value: createdBy },
 { $Type: 'UI.DataField', Value: modifiedAt },
 { $Type: 'UI.DataField', Value: modifiedBy },
    { $Type: 'UI.DataField', Label: 'Donor', Value: donor_ID }
  ]
};

annotate donorMgmtSrv.Donations with {
  donor @Common.Text: { $value: donor.name, ![@UI.TextArrangement]: #TextOnly }
};

annotate donorMgmtSrv.Donations with {
  donor @Common.Label: 'Donor'
};

annotate donorMgmtSrv.Donations with @UI.Facets: [
  { $Type: 'UI.ReferenceFacet', ID: 'Main', Label: 'General Information', Target: '@UI.FieldGroup#Main' }
];

annotate donorMgmtSrv.Donations with @UI.SelectionFields: [
  donor_ID
];

annotate donorMgmtSrv.Donors actions {
  DonorSummary @(
    Common.SideEffects: { TargetProperties: ['summary'] }
  );
};

annotate donorMgmtSrv.Donors actions {
  generateDonorEngagementRecommendation @(
    Common.SideEffects: { TargetProperties: ['nextstep'] }
  );
};




