import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import moment from "moment";
import SearchAndSelect from "./SelectSearch";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, TextField } from "@mui/material";
import { CreateBranch,getAllBranch,AllEventBook,EventBook,GetEventPkg } from "services/Dashboard";
import { useMutation } from "@tanstack/react-query"; 
import { useQuery } from '@tanstack/react-query';

const EventCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  console.log("🚀 ~ file: Checkcalendar.js:16 ~ selectedDate:", selectedDate)
  const [eventDetails, setEventDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
const [staffbranch,setStaffBranch] = useState('')
const [eventpkg,seteventpkg] = useState()
const [select,setselect] = useState()
const [getprice,setprice] = useState()
const [branch,setBranch] = useState([])
const [allbooking,setallbooking] = useState([])
const [getEvent, setEvent] = useState({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  address: "",
  payment_mode: "",
  event_type:null,
  amount:null,
  branch_id:null
  // date:selectedDate ?? new Date(selectedDate && selectedDate).toLocaleDateString('en-GB')
});
console.log("🚀 ~ file: Checkcalendar.js:36 ~ getEvent:", getEvent)
// const date = new Date("Tue May 02 2023 00:00:00 GMT+0100 (West Africa Standard Time)");

const cUser = JSON.parse(localStorage.getItem("role_id"))
const eventUsers = [1,2,9]

const isallowed = () => {
  return eventUsers.includes(cUser)
}

const {allEventBook,refetch} = useQuery({
  
  queryKey:['AllEventBook'],
  queryFn: () => AllEventBook(),
  onSuccess:(d) =>{
    setallbooking(d?.data?.allevents)
  }
  // onError: (err) => {
 
});
const {getallBranch} = useQuery({
  
  queryKey:['getAllBranch'],
  queryFn: () => getAllBranch(),
  onSuccess:(d) =>{
    setBranch(d?.data?.braches)
  }
  // onError: (err) => {
 
});

const { data, isloading, error } = useQuery({
  queryKey: ['GetEventPkg'],
  queryFn: () => GetEventPkg(),
  onSuccess: (d) => {
    seteventpkg(d?.data?.pkgs)
  },
  // onError: (err) => {},
});


const handleChange = (event) => {
  const { value, name } = event.target
  setStaff(value);

  setselect(prev => {
    return {
      ...prev,
      [name]:parseInt(value)
    }
  })
};

const handleStaffChange = (event) => {
  const { value, name } = event.target
  setStaffBranch(value);
  setEvent(prev => {
    return {
      ...prev,
      [name]:parseInt(value)
    }
  })

};






  const handleDateClick = (info) => {
    console.log("🚀 ~ file: Checkcalendar.js:95 ~ handleDateClick ~ info:", info)
    setSelectedDate(info.date);
    setEvent(prev => {
      return{
        ...prev,
        date:info?.dateStr
      }
    })
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    setEventDetails(info.event.extendedProps.booking);
    setModalOpen(true);
    console.log("🚀 ~ file: Checkcalendar.js:104 ~ handleEventClick ~ info.event:", info.event)
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDate(null);
    setEventDetails(null);
    setNewEventTitle("");
  };

  const bookeEvents = (e) => {
    const { value, name } = e.target
    const price = eventpkg?.find(d => d?._id === getEvent?.event_type)
    setEvent((prev) => {
      return {...prev, [name]:value,amount:Number(price?.price),branch_id:JSON.parse(localStorage.getItem("branchId"))}
    })

      
     console.log("🚀 ~ file: Checkcalendar.js:57 ~ bookeEvents ~ getEvent:", getEvent)
  }

  const handleNewEventSubmit = (e) => {
    e.preventDefault()
    console.log(e)
    mutate(getEvent)
  };

  const { mutate, isLoading, isError } = useMutation({
    mutationFn: EventBook,
    onSuccess: (data) => {
      if (data?.status) {
        refetch()
        setModalOpen(false);
    setSelectedDate(null);
    setEventDetails(null);
    setNewEventTitle("");
        // seteventpkg((prevPkg) => [...prevPkg, data?.data?.pkg]);
      }
      // return  setclose(!getclose)
    },
  });

  const isDateBooked = (date) => {
    // In this example, we assume that a date is booked if it already has an event associated with it
    const bookeEvents = [
      { title: "Event 1", start: "2023-04-01", allDay: false },
      { title: "Event 2", start: "2023-04-03", allDay: true },
    ];
    return bookeEvents.some((event) =>
      new Date(event?.start) ===  new Date(date)
    );
  };

  const getPrice = () => {
   const price = eventpkg?.find(d => d._id === getEvent?.event_type)
   console.log("🚀 ~ file: Checkcalendar.js:134 ~ getPrice ~ price:", price)
   
  }

  return (
    <div>
     

      {
        isallowed && 
          <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
  
          events={[
            ...allbooking.map(d => {
              return {
                title:d?.eventconfig?.event_type,start:d?.date,
                extendedProps:{
                  booking: {
                    name: `${d?.first_name} ${d?.last_name}`,
                    phone:d?.phone_number ,
                    address:d?.address,
                    mode:d?.payment_mode,
                    email:d?.email,
                    branch:d?.branch?.name,
                    amount:d?.amount,
                    reference_id:d?.reference_id
                    // guestEmail: "johndoe@example.com",
                    // guestPhone: "123-456-7890",
                    // guestsCount: 2,
                    },
                }
              }
            })
          ]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventClassNames={(info) =>
            isDateBooked(info.event.start) ? "booked-date" : "free-date"
          }
        />
        
      }

      <Dialog open={modalOpen} onClose={handleModalClose}> 
        {selectedDate && (
      <form  onChange={(e) =>console.log(e)}>
          <DialogTitle>Book a new Event {moment(selectedDate).format("LL")}</DialogTitle>
          <DialogContent>
          <DialogContentText>
          Please provide your booking details below:
          </DialogContentText>
          <div style={{display:"flex",flexWrap:"wrap",gap:"10px"}}>
          <TextField
          required
          margin="dense"
          label="first name"
          type="text"
          name="first_name"
          // value={guestName}
          onChange={bookeEvents}
          />
          <TextField
          required
          margin="dense"
          label="last name"
          type="text"
          name="last_name"
          // value={guestName}
          onChange={bookeEvents}
          />
          
          <TextField
          required
          margin="dense"
          label="email"
          type="email"
          name="email"
          // value={guestEmail}
          onChange={bookeEvents}
          />
          <TextField
          required
          margin="dense"
          label="phone_number"
          type="tel"
          name="phone_number"
          // value={guestPhone}
          onChange={bookeEvents}
          />
          <TextField
          required
          margin="dense"
          label="address"
          type="text"
          name="address"
          // value={guestsCount}
          onChange={bookeEvents}
          />
    <div style={{width:"100%",display:"flex",gap:"10px"}}>
  
      <div style={{flex:"0.5",width:"50%"}}>
            <small>Event type</small>
            <br/>
            <Select sx={{width:'100%',py:1}}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              // value={staffbranch}
              label="Staff Branch"
              // onChange={handleStaffChange}
              onChange={bookeEvents}
              placeholder="event_type"
              name="event_type"
  
      >

  {
   isallowed && (eventpkg && eventpkg.map(d => {
      return (
        <MenuItem value={d?._id}>{d?.event_type}</MenuItem>

      )
    }))
  }
    {/* <MenuItem value="cash">cash</MenuItem>
    <MenuItem value="free">free</MenuItem>
    <MenuItem value="cheque">cheque</MenuItem>
    <MenuItem value="transfer">transfer</MenuItem>
    <MenuItem value="scanbank">bankscan</MenuItem> */}


</Select>
      </div>
      <div style={{flex:"0.5",width:"50%"}}>
<small>payment mode</small>
<br/>
            <Select sx={{width:'100%',py:1}}
  labelId="demo-simple-select-label"
  id="demo-simple-select"
  // value={staffbranch}
  label="Staff Branch"
  // onChange={handleStaffChange}
  onChange={bookeEvents}
  placeholder="payment_mode"
  name="payment_mode"
  
>
    <MenuItem value="card">card</MenuItem>
    <MenuItem value="cash">cash</MenuItem>
    <MenuItem value="free">free</MenuItem>
    <MenuItem value="cheque">cheque</MenuItem>
    <MenuItem value="transfer">transfer</MenuItem>
    <MenuItem value="scanbank">bankscan</MenuItem>


</Select>

      </div>
      <div style={{flex:"0.5",width:"50%"}}>
<small>branch</small>
<br/>
            <Select sx={{width:'100%',py:1}}
  labelId="demo-simple-select-label"
  id="demo-simple-select"
  // value={staffbranch}
  // onChange={handleStaffChange}
  value={staffbranch}
  label="Staff Branch"
  onChange={handleStaffChange}
  placeholder="branch_id"
  name="branch_id"
  
>
      {isallowed && branch.map(d => {
            return (
              <MenuItem value={d?._id}>{d?.name}</MenuItem>
              // <MenuItem value={0}>{'work for ceo'}</MenuItem>
            )
          })}
   


</Select>

      </div>
      
</div>

<TextField
          required
          margin="dense"
          label="amount"
          type="number"
          aria-readonly
          name="amount"
          value={getEvent && getEvent?.amount || 0}
          onChange={bookeEvents}
          />
  <br/>
      </div>
      </DialogContent>

          </form>
      
        )}
          <DialogActions>
          <Button onClick={handleModalClose}>Cancel</Button>
          <Button type="button" onClick={handleNewEventSubmit}>{ isLoading ? 'loading ...' : "Book Now"}</Button>
      </DialogActions>
        </Dialog>

{eventDetails && (
        <Dialog open={modalOpen} onClose={handleModalClose}>
          <DialogTitle>{eventDetails.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {/* Start: {eventDetails.start.toLocaleString()} */}
            </DialogContentText>
            <DialogContentText>
              Name: {eventDetails?.name}
            </DialogContentText>
            <DialogContentText>
              Phone: {eventDetails?.phone}
            </DialogContentText>
            <DialogContentText>
              Payment Mode: {eventDetails?.mode}
            </DialogContentText>
            <DialogContentText>
            address: {eventDetails?.address}
            </DialogContentText>
            <DialogContentText>
            email: {eventDetails?.email}
            </DialogContentText>
            <DialogContentText>
            branch: {eventDetails?.branch}
            </DialogContentText>
            <DialogContentText>
            amount: {eventDetails?.amount}
            </DialogContentText>
            <DialogContentText>
            refrenceId: {eventDetails?.reference_id}
            </DialogContentText>
            {/* {eventDetails.end && (
              <DialogContentText>
                End: {eventDetails.end.toLocaleString()}
              </DialogContentText>
            )} */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleModalClose}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default EventCalendar;