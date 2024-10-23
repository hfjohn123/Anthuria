export type Message = {
  type: string;
  sender?: string;
  content: string;
  citations?: Citation[];
  time: Date;
};

export type Citation = {
  generatedResponsePart: {
    textResponsePart: {
      span: {
        end: number;
        start: number;
      };
      text: string;
    };
  };
  retrievedReferences: {
    content: {
      text: string;
    };
    location: {
      s3Location: {
        uri: string;
      };
      type: string;
    };
  }[];
};
