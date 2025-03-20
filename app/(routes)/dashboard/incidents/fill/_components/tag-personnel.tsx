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

  return (
    <Card className="w-1/2 p-4">
      <div className="space-y-6">
        {/* Primary Resident Selection (Single Select) */}
        <div>
          <div className="flex gap-2 justify-start items-center">
            <div className="flex items-center gap-1">
              <UserRound className="mb-2" />
              <Label className="block md:text-sm font-semibold pl-1">
                Primary Resident
              </Label>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <CirclePlus className="w-4 h-4 text-blue-400" />
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
                <Command>
                  <CommandInput
                    placeholder="Search resident..."
                    onValueChange={handlePrimaryResidentSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No resident found.</CommandEmpty>
                    <CommandGroup>
                      {primaryResidentOptions.map((resident) => (
                        <CommandItem
                          key={resident.id}
                          onSelect={() =>
                            setValue(`primary_resident`, resident)
                          }
                        >
                          {resident.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {primaryResident ? (
            <Badge variant="secondary" className="font-medium">
              {primaryResident?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setValue(`primary_resident`, null)}
              />
            </Badge>
          ) : null}
        </div>

        {/* Involved Residents Selection (Multi-Select) */}
        <div className="">
          <div className="flex items-center gap-2 pb-2">
            <UsersRound strokeWidth={1} className="mb-2" />
            <Label className="block md:text-sm font-medium">
              Involved Residents
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <CirclePlus className="w-4 h-4 text-blue-400" />
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
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
                        .map((resident) => (
                          <CommandItem
                            key={resident.id}
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
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                involvedResidents.includes(resident)
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
          <div className="flex flex-wrap gap-2 mb-2">
            {involvedResidents.map((resident) => {
              return resident ? (
                <Badge
                  key={resident.id}
                  variant="secondary"
                  className="font-medium"
                >
                  {resident.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setValue(
                        "involved_residents",
                        involvedResidents.filter((r) => r.id !== resident.id),
                      )
                    }
                  />
                </Badge>
              ) : null;
            })}
          </div>
        </div>

        {/* Involved Caregivers Selection (Multi-Select) */}
        <div>
          <div className="flex items-center gap-2 pb-2">
            <UsersRound strokeWidth={1} className="mb-2" />
            <Label className="block md:text-sm font-medium">
              Involved Caregivers
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <CirclePlus className="w-4 h-4 text-blue-400" />
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
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
                        .map((caregiver) => (
                          <CommandItem
                            key={caregiver.id}
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
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                involvedCaregivers.includes(caregiver)
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
          <div className="flex flex-wrap gap-2 mb-2">
            {involvedCaregivers.map((caregiver) => {
              return caregiver ? (
                <Badge
                  key={caregiver.id}
                  variant="secondary"
                  className="font-medium"
                >
                  {caregiver.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setValue(
                        "involved_caregivers",
                        involvedCaregivers.filter((c) => c.id !== caregiver.id),
                      )
                    }
                  />
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
