import { axiosInstancePrivate } from "@/utils/request";


export const createReminder = async (data: any) => {
    const response = await axiosInstancePrivate.post(
      `reminders/create`,
      {
       data
      }
    );
    return response;
  };  
  export const updateReminder = async (id: any, data: any) => {
    const response = await axiosInstancePrivate.patch(`/reminders/edit/${id}`, data);
    return response;
  };
  export const removeReminder = async (id: any, data: any) => {
    const response = await axiosInstancePrivate.delete(`/reminders/delete/${id}`);
    return response;
  };

  export const getRemindersByUserTypeAndItem = async ({user_id, type, item_id,status,orderBy,orderDirection,pageNo,limit,search}:any) => {
    const response = await axiosInstancePrivate.get(
      `/reminders/by-user-type-item?status=${status?status:"pending"}&orderBy=${orderBy?orderBy:"created_at"}&orderDirection=${orderDirection?orderDirection:"desc"}&pageNo=${pageNo?pageNo:""}&limit=${limit?limit:""}&search=${search?search:""}`,
      {
        params: { user_id, type, item_id:item_id?item_id:"" }
      }
    );
    
    return response;
  };

  
  
  
 
  
 