@extends('layouts.master')
@section('page_title', 'Manage TimeTables')
@section('content')

    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h6 class="card-title"><i class="icon-calendar5 mr-2"></i> Manage TimeTables</h6>
            
            @if(Qs::userIsTeamSA())
                <!-- Create Timetable Button -->
                <button type="button" class="btn btn-primary btn-sm d-flex align-items-center" data-toggle="modal" data-target="#createTimetableModal" style="border-radius: 8px;">
                    <i class="icon-plus-circle2 mr-2"></i> Create Timetable
                </button>
            @endif
        </div>

        <div class="card-body">
            <!-- Navigation Tabs for Timetable Lists -->
            <ul class="nav nav-tabs nav-tabs-highlight">
                <li class="nav-item">
                    <a href="#all-timetables" class="nav-link active" data-toggle="tab">All Classes</a>
                </li>
                <li class="nav-item dropdown">
                    <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown">Class Timetables</a>
                    <div class="dropdown-menu dropdown-menu-right">
                        @foreach($my_classes as $mc)
                            <a href="#ttr{{ $mc->id }}" class="dropdown-item" data-toggle="tab">{{ $mc->name }}</a>
                        @endforeach
                    </div>
                </li>
            </ul>

            <!-- Tab Contents -->
            <div class="tab-content">

                <!-- Tab 1: All Classes Timetables (Active by default) -->
                <div class="tab-pane fade show active" id="all-timetables">
                    <table class="table datatable-button-html5-columns">
                        <thead>
                        <tr>
                            <th>S/N</th>
                            <th>Name</th>
                            <th>Class</th>
                            <th>Type</th>
                            <th>Year</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($tt_records as $ttr)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $ttr->name }}</td>
                                <td>{{ $ttr->my_class->name }}</td>
                                <td>{{ ($ttr->exam_id) ? $ttr->exam->name : 'Class TimeTable' }}</td>
                                <td>{{ $ttr->year }}</td>
                                <td class="text-center">
                                    <div class="list-icons">
                                        <div class="dropdown">
                                            <a href="#" class="list-icons-item" data-toggle="dropdown">
                                                <i class="icon-menu9"></i>
                                            </a>
                                            <div class="dropdown-menu dropdown-menu-right">
                                                {{--View--}}
                                                <a href="{{ route('ttr.show', $ttr->id) }}" class="dropdown-item"><i class="icon-eye"></i> View</a>

                                                @if(Qs::userIsTeamSA())
                                                    {{--Manage--}}
                                                    <a href="{{ route('ttr.manage', $ttr->id) }}" class="dropdown-item"><i class="icon-plus-circle2"></i> Manage</a>
                                                    {{--Edit--}}
                                                    <a href="{{ route('ttr.edit', $ttr->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                                @endif

                                                {{--Delete--}}
                                                @if(Qs::userIsSuperAdmin())
                                                    <a id="{{ $ttr->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                                    <form method="post" id="item-delete-{{ $ttr->id }}" action="{{ route('ttr.destroy', $ttr->id) }}" class="hidden">@csrf @method('delete')</form>
                                                @endif
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>

                <!-- Tab 2: Class Specific Timetables -->
                @foreach($my_classes as $mc)
                    <div class="tab-pane fade" id="ttr{{ $mc->id }}">
                        <table class="table datatable-button-html5-columns">
                            <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Type</th>
                                <th>Year</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($tt_records->where('my_class_id', $mc->id) as $ttr)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $ttr->name }}</td>
                                    <td>{{ $ttr->my_class->name }}</td>
                                    <td>{{ ($ttr->exam_id) ? $ttr->exam->name : 'Class TimeTable' }}</td>
                                    <td>{{ $ttr->year }}</td>
                                    <td class="text-center">
                                        <div class="list-icons">
                                            <div class="dropdown">
                                                <a href="#" class="list-icons-item" data-toggle="dropdown">
                                                    <i class="icon-menu9"></i>
                                                </a>
                                                <div class="dropdown-menu dropdown-menu-right">
                                                    {{--View--}}
                                                    <a href="{{ route('ttr.show', $ttr->id) }}" class="dropdown-item"><i class="icon-eye"></i> View</a>

                                                    @if(Qs::userIsTeamSA())
                                                        {{--Manage--}}
                                                        <a href="{{ route('ttr.manage', $ttr->id) }}" class="dropdown-item"><i class="icon-plus-circle2"></i> Manage</a>
                                                        {{--Edit--}}
                                                        <a href="{{ route('ttr.edit', $ttr->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                                    @endif

                                                    {{--Delete--}}
                                                    @if(Qs::userIsSuperAdmin())
                                                        <a id="{{ $ttr->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                                        <form method="post" id="item-delete-{{ $ttr->id }}" action="{{ route('ttr.destroy', $ttr->id) }}" class="hidden">@csrf @method('delete')</form>
                                                    @endif
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                @endforeach

            </div>
        </div>
    </div>

    @if(Qs::userIsTeamSA())
        <!-- CREATE TIMETABLE MODAL -->
        <div id="createTimetableModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="createTimetableModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                    <div class="modal-header bg-primary text-white" style="padding: 1.2rem 1.5rem;">
                        <h5 class="modal-title" id="createTimetableModalLabel" style="font-weight: 700; color: #ffffff !important;"><i class="icon-calendar5 mr-2"></i> Create Timetable</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.8; font-size: 1.5rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form class="ajax-store" method="post" action="{{ route('ttr.store') }}">
                        @csrf
                        <div class="modal-body" style="padding: 1.5rem;">
                            <div class="form-group">
                                <label class="font-weight-semibold">Name <span class="text-danger">*</span></label>
                                <input name="name" value="{{ old('name') }}" required type="text" class="form-control" placeholder="Name of TimeTable">
                            </div>

                            <div class="form-group">
                                <label for="modal_my_class_id" class="font-weight-semibold">Class <span class="text-danger">*</span></label>
                                <select required data-placeholder="Select Class" class="form-control select" name="my_class_id" id="modal_my_class_id">
                                    @foreach($my_classes as $mc)
                                        <option {{ old('my_class_id') == $mc->id ? 'selected' : '' }} value="{{ $mc->id }}">{{ $mc->name }}</option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="modal_exam_id" class="font-weight-semibold">Type (Class or Exam)</label>
                                <select class="select form-control" name="exam_id" id="modal_exam_id">
                                    <option value="">Class Timetable</option>
                                    @foreach($exams as $ex)
                                        <option {{ old('exam_id') == $ex->id ? 'selected' : '' }} value="{{ $ex->id }}">{{ $ex->name }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer" style="background-color: #f8fafc; border-top: 1px solid rgba(0,0,0,0.05); padding: 1rem 1.5rem;">
                            <button type="button" class="btn btn-light" data-dismiss="modal" style="border-radius: 8px;">Cancel</button>
                            <button id="ajax-btn" type="submit" class="btn btn-primary">Submit <i class="icon-paperplane ml-2"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif

@endsection
