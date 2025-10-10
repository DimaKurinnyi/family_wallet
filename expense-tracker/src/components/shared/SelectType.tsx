import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export const SelectType = () => {
  return (
    <Select>
      
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="EN" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="English">EN </SelectItem>
          <SelectItem value="Spanish">ES</SelectItem>
          <SelectItem value="French">FR</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
