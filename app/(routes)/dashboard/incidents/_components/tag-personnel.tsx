"use client";

import { getCaregiverTags, getResidentTags } from "@/app/api/report";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CaregiverTag, ResidentTag } from "@/types/report";
import { User } from "@/types/user";
import debounce from "lodash.debounce";
import { Check, CirclePlus, UserRound, UsersRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ReportSchema } from "../schema";

interface PersonSelectorProps {
  user: User;
}

export default function PersonSelector({ user }: PersonSelectorProps) {
  const { watch, setValue } = useFormContext<ReportSchema>();

  const primaryResident = watch("primary_resident");
  const involvedResidents = watch("involved_residents");
  const involvedCaregivers = watch("involved_caregivers");

  const [primaryResidentOptions, setPrimaryResidentOptions] = useState<
    ResidentTag[]
  >([]);
  const [involvedResidentOptions, setInvolvedResidentOptions] = useState<
    ResidentTag[]
  >([]);
  const [caregiverOptions, setCaregiverOptions] = useState<CaregiverTag[]>([]);

  const [primaryResidentSearch, setPrimaryResidentSearch] = useState("");
  const [involvedResidentSearch, setInvolvedResidentSearch] = useState("");
  const [caregiverSearch, setCaregiverSearch] = useState("");

  const debouncedFetchResidents = debounce(async (search: string) => {
    const results = await getResidentTags(search);
    setPrimaryResidentOptions(results);
    setInvolvedResidentOptions(results);
  }, 300);

  const debouncedFetchCaregivers = debounce(async (search: string) => {
    const results = await getCaregiverTags(search);
    setCaregiverOptions(results);
  }, 300);

  const handlePrimaryResidentSearch = (search: string) => {
    setPrimaryResidentSearch(search);
    debouncedFetchResidents(search);
  };

  const handleInvolvedResidentSearch = (search: string) => {
    setInvolvedResidentSearch(search);
    debouncedFetchResidents(search);
  };

  const handleCaregiverSearch = (search: string) => {
    setCaregiverSearch(search);
    debouncedFetchCaregivers(search);
  };

  useEffect(() => {
    debouncedFetchResidents("");
    debouncedFetchCaregivers("");
  }, []);

  const handlePrimaryResidentChange = (residentId: string) => {
    const resident = primaryResidentOptions.find((r) => r.id === residentId);
    if (resident) {
      setValue("primary_resident", resident);
    }
  };

  return (
    <div className="w-full lg:w-2/3">
      <Card className="p-5 border bg-white shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          People Involved
        </h3>

        <div className="space-y-5">
          <div className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <UserRound className="h-4 w-4 text-green-600" />
              <Label className="text-sm font-medium text-gray-700">
                Primary Resident
              </Label>
            </div>

            <div>
              <Select
                value={primaryResident?.id || ""}
                onValueChange={handlePrimaryResidentChange}
              >
                <SelectTrigger className="w-full bg-white border-green-200 focus:ring-transparent ">
                  <SelectValue placeholder="Select primary resident" />
                </SelectTrigger>
                <SelectContent>
                  {primaryResidentOptions.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-gray-500">
                      No residents found
                    </div>
                  ) : (
                    primaryResidentOptions.map((resident) => (
                      <SelectItem
                        key={resident.id}
                        value={resident.id}
                        className="cursor-pointer"
                      >
                        {resident.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <UsersRound className="h-4 w-4 text-gray-500" />
              <Label className="text-sm font-medium text-gray-700">
                Involved Residents
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full py-1 px-2 transition-colors">
                    <CirclePlus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[280px]">
                  <Command>
                    <CommandInput
                      placeholder="Search residents..."
                      onValueChange={handleInvolvedResidentSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No resident found.</CommandEmpty>
                      <CommandGroup>
                        {involvedResidentOptions
                          .filter(
                            (resident) =>
                              !(resident.name === primaryResident?.name),
                          )
                          .map((resident, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => {
                                involvedResidents.some(
                                  (r) => r.id === resident.id,
                                )
                                  ? setValue(
                                      "involved_residents",
                                      involvedResidents.filter(
                                        (r) => r.id !== resident.id,
                                      ),
                                    )
                                  : setValue("involved_residents", [
                                      ...involvedResidents,
                                      resident,
                                    ]);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-gray-600",
                                  involvedResidents.some(
                                    (r) => r.id === resident.id,
                                  )
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {resident.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
              {involvedResidents && involvedResidents.length > 0 ? (
                involvedResidents.map((resident) => {
                  return resident ? (
                    <Badge
                      key={resident.id}
                      variant="secondary"
                      className="font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                    >
                      {resident.name}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer text-gray-600 hover:text-gray-800"
                        onClick={() =>
                          setValue(
                            "involved_residents",
                            involvedResidents.filter(
                              (r) => r.id !== resident.id,
                            ),
                          )
                        }
                      />
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-xs text-gray-500 italic">
                  No other residents involved
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <UsersRound className="h-4 w-4 text-blue-500" />
              <Label className="text-sm font-medium text-gray-700">
                Involved Caregivers
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <button className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full py-1 px-2 transition-colors">
                    <CirclePlus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[280px]">
                  <Command>
                    <CommandInput
                      placeholder="Search caregivers..."
                      onValueChange={handleCaregiverSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No caregiver found.</CommandEmpty>
                      <CommandGroup>
                        {caregiverOptions
                          .filter((caregiver) => !(caregiver.id === user?.id))
                          .map((caregiver, index) => (
                            <CommandItem
                              key={index}
                              onSelect={() => {
                                involvedCaregivers.some(
                                  (c) => c.id === caregiver.id,
                                )
                                  ? setValue(
                                      "involved_caregivers",
                                      involvedCaregivers.filter(
                                        (c) => c.id !== caregiver.id,
                                      ),
                                    )
                                  : setValue("involved_caregivers", [
                                      ...involvedCaregivers,
                                      caregiver,
                                    ]);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 text-blue-600",
                                  involvedCaregivers.some(
                                    (c) => c.id === caregiver.id,
                                  )
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {caregiver.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2">
              {involvedCaregivers && involvedCaregivers.length > 0 ? (
                involvedCaregivers.map((caregiver, index) => {
                  return caregiver ? (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      {caregiver.name}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          setValue(
                            "involved_caregivers",
                            involvedCaregivers.filter(
                              (c) => c.id !== caregiver.id,
                            ),
                          )
                        }
                      />
                    </Badge>
                  ) : null;
                })
              ) : (
                <span className="text-xs text-gray-500 italic">
                  No other caregivers involved
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
