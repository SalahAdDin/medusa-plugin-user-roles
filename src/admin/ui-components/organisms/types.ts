type CreateModalProps = {
  handleClose: () => void;
};

type FieldListElement = {
  id: string;
  selected: boolean;
  index: number;
};

type BooleanIdFieldArray = Array<{
  id: string;
  selected: boolean;
}>;

export type { BooleanIdFieldArray, CreateModalProps, FieldListElement };
