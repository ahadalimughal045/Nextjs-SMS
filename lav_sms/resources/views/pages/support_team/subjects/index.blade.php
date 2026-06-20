@extends('layouts.master')
@section('page_title', 'Manage Subjects')
@section('content')

    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h6 class="card-title"><i class="icon-pin mr-2"></i> Manage Subjects</h6>

            @if(Qs::userIsTeamSA())
                <button type="button" class="btn btn-primary btn-sm d-flex align-items-center" data-toggle="modal" data-target="#createSubjectModal" style="border-radius: 8px;">
                    <i class="icon-plus-circle2 mr-2"></i> Add Subject
                </button>
            @endif
        </div>

        <div class="card-body">
            <ul class="nav nav-tabs nav-tabs-highlight">
                @foreach($my_classes as $c)
                    <li class="nav-item">
                        <a href="#c{{ $c->id }}" class="nav-link {{ $loop->first ? 'active' : '' }}" data-toggle="tab">{{ $c->name }}</a>
                    </li>
                @endforeach
            </ul>

            <div class="tab-content">

                @foreach($my_classes as $c)
                    <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}" id="c{{ $c->id }}">
                        <table class="table datatable-button-html5-columns">
                            <thead>
                            <tr>
                                <th>S/N</th>
                                <th>Name</th>
                                <th>Short Name</th>
                                <th>Class</th>
                                <th>Teacher</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($subjects->where('my_class.id', $c->id) as $s)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $s->name }} </td>
                                    <td>{{ $s->slug }} </td>
                                    <td>{{ $s->my_class->name }}</td>
                                    <td>{{ $s->teacher->name }}</td>
                                    <td class="text-center">
                                        <div class="list-icons">
                                            <div class="dropdown">
                                                <a href="#" class="list-icons-item" data-toggle="dropdown">
                                                    <i class="icon-menu9"></i>
                                                </a>

                                                <div class="dropdown-menu dropdown-menu-left">
                                                    {{--edit--}}
                                                    @if(Qs::userIsTeamSA())
                                                        <a href="{{ route('subjects.edit', $s->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                                    @endif
                                                    {{--Delete--}}
                                                    @if(Qs::userIsSuperAdmin())
                                                        <a id="{{ $s->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                                        <form method="post" id="item-delete-{{ $s->id }}" action="{{ route('subjects.destroy', $s->id) }}" class="hidden">@csrf @method('delete')</form>
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
        <!-- CREATE SUBJECT MODAL -->
        <div id="createSubjectModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="createSubjectModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                    <div class="modal-header bg-primary text-white" style="padding: 1.2rem 1.5rem;">
                        <h5 class="modal-title" id="createSubjectModalLabel" style="font-weight: 700; color: #ffffff !important;"><i class="icon-pin mr-2"></i> Add Subject</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.8; font-size: 1.5rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form class="ajax-store" method="post" action="{{ route('subjects.store') }}">
                        @csrf
                        <div class="modal-body" style="padding: 1.5rem;">

                            <div class="form-group">
                                <label for="modal_sub_name" class="font-weight-semibold">Name <span class="text-danger">*</span></label>
                                <input id="modal_sub_name" name="name" value="{{ old('name') }}" required type="text" class="form-control" placeholder="Name of subject">
                            </div>

                            <div class="form-group">
                                <label for="modal_slug" class="font-weight-semibold">Short Name <span class="text-danger">*</span></label>
                                <input id="modal_slug" required name="slug" value="{{ old('slug') }}" type="text" class="form-control" placeholder="Eg. B.Eng">
                            </div>

                            <div class="form-group">
                                <label for="modal_sub_class_id" class="font-weight-semibold">Select Class <span class="text-danger">*</span></label>
                                <select required data-placeholder="Select Class" class="form-control select" name="my_class_id" id="modal_sub_class_id">
                                    <option value=""></option>
                                    @foreach($my_classes as $c)
                                        <option {{ old('my_class_id') == $c->id ? 'selected' : '' }} value="{{ $c->id }}">{{ $c->name }}</option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="modal_sub_teacher_id" class="font-weight-semibold">Teacher <span class="text-danger">*</span></label>
                                <select required data-placeholder="Select Teacher" class="form-control select-search" name="teacher_id" id="modal_sub_teacher_id">
                                    <option value=""></option>
                                    @foreach($teachers as $t)
                                        <option {{ old('teacher_id') == Qs::hash($t->id) ? 'selected' : '' }} value="{{ Qs::hash($t->id) }}">{{ $t->name }}</option>
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
