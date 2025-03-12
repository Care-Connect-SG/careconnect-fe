"use client";

import { getCaregiverTags, getResidentTags } from "@/app/api/report";
import { getCurrentUser } from "@/app/api/user";
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
import { ReportState } from "@/hooks/useReportReducer";
import { cn } from "@/lib/utils";
import { CaregiverTag, ResidentTag } from "@/types/report";
import { UserResponse } from "@/types/user";
import debounce from "lodash.debounce";
import { Check, CirclePlus, UserRound, UsersRound, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ResidentSelectorProps {
  dispatch: any;
  selectedState: ReportState;
}

export default function ResidentSelector({
  dispatch,
  selectedState,
}: ResidentSelectorProps) {
  const { primaryResident, involvedResidents, involvedCaregivers } =
    selectedState;
  const { data: session } = useSession();

  const [user, setUser] = useState<UserResponse>();

  useEffect(() => {
    async function fetchUserId() {
      if (session?.user?.email) {
        try {
          const user = await getCurrentUser(session.user.email);
          setUser(user);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    }
    fetchUserId();
  }, [session]);

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
                            dispatch({
                              type: "SET_PRIMARY_RESIDENT",
                              payload: resident,
                            })
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
                onClick={() =>
                  dispatch({
                    type: "UNSET_PRIMARY_RESIDENT",
                    payload: primaryResident?.id,
                  })
                }
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
                            onSelect={() =>
                              dispatch({
                                type: involvedResidents.some(
                                  (r) => r.id === resident.id,
                                )
                                  ? "REMOVE_INVOLVED_RESIDENT"
                                  : "ADD_INVOLVED_RESIDENT",
                                payload: resident,
                              })
                            }
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
                      dispatch({
                        type: "REMOVE_INVOLVED_RESIDENT",
                        payload: resident.id,
                      })
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
                            onSelect={() =>
                              dispatch({
                                type: involvedCaregivers.some(
                                  (c) => c.id === caregiver.id,
                                )
                                  ? "REMOVE_INVOLVED_CAREGIVER"
                                  : "ADD_INVOLVED_CAREGIVER",
                                payload: caregiver,
                              })
                            }
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
                      dispatch({
                        type: "REMOVE_INVOLVED_CAREGIVER",
                        payload: caregiver.id,
                      })
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
